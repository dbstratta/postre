import path from 'path';
import { promises as fs, Dirent } from 'fs';

import { Ora } from 'ora';

import { Client, Transaction } from '../clients';
import { MigrationError } from '../errors';
import { MigrationConfiguration } from '../config';

import { MigrationFilename } from './types';

export type MigrationTuple = [MigrationFilename, Migration];

export type Migration = {
  migrate: MigrationFunction;
  rollback: MigrationFunction;
};

export type MigrationFunction = (client: Client | Transaction<Client>) => Promise<void>;

export async function findAndImportAllMigrations(
  configuration: MigrationConfiguration,
  spinner: Ora,
): Promise<MigrationTuple[]> {
  const migrationFilenames = await getMigrationFilenames(configuration);

  const migrationTuples = await importAllMigrations(migrationFilenames, configuration, spinner);

  return migrationTuples;
}

async function getMigrationFilenames(configuration: MigrationConfiguration): Promise<string[]> {
  const dirEntities: Dirent[] = await fs.readdir(configuration.migrationFilesDirectoryPath, {
    withFileTypes: true,
  });

  const filenames = dirEntities
    .filter(dirEntity => dirEntity.isFile())
    .map(dirEntity => dirEntity.name)
    .sort();

  return filenames;
}

async function importAllMigrations(
  migrationFilenames: MigrationFilename[],
  configuration: MigrationConfiguration,
  spinner: Ora,
): Promise<MigrationTuple[]> {
  spinner.start('loading migration files');

  let migrationTuples: MigrationTuple[];

  try {
    migrationTuples = await Promise.all(
      migrationFilenames.map(
        async migrationFilename =>
          [
            migrationFilename,
            await importMigration(
              path.resolve(configuration.migrationFilesDirectoryPath, migrationFilename),
            ),
          ] as MigrationTuple,
      ),
    );
  } catch (error) {
    spinner.fail("couldn't load migration files");

    throw error;
  }

  spinner.succeed('migration files loaded successfully');

  return migrationTuples;
}

export async function importMigration(migrationFilename: MigrationFilename): Promise<Migration> {
  const migration = await import(migrationFilename);

  validateMigration(migrationFilename, migration);

  return migration;
}

export function validateMigration(
  migrationFilename: MigrationFilename,
  migration: Migration,
): void {
  if (
    typeof migration !== 'object' ||
    typeof migration.migrate !== 'function' ||
    typeof migration.rollback !== 'function'
  ) {
    throw new MigrationError(`Invalid file ${migrationFilename}`);
  }
}

export async function createMigrationFilesDirectory(
  configuration: MigrationConfiguration,
  spinner: Ora,
): Promise<void> {
  try {
    await fs.access(configuration.migrationFilesDirectoryPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      spinner.start('creating migration files directory');

      await fs.mkdir(configuration.migrationFilesDirectoryPath, {
        recursive: true,
      });

      spinner.succeed('migration files directory created');
    } else {
      spinner.fail("couldn't create migration files directory");

      throw error;
    }
  }
}
