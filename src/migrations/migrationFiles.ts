import path from 'path';
import fs, { Dirent } from 'fs';

import { Client, Transaction } from '../clients';
import { MigrationError } from '../errors';
import { MigrationConfiguration } from '../config';
import { spinner } from '../helpers';

import { MigrationFilename, MigrationId } from './types';
import { getMigrationIdFromFilename } from './helpers';

export type Migration = {
  id: MigrationId;
  filename: MigrationFilename;
} & ImportedMigration;

export type ImportedMigration = {
  migrate: MigrationFunction;
  rollback: MigrationFunction;
  disableTransaction?: boolean;
};

export type MigrationFunction = (
  client: Client | Transaction<Client>,
) => Promise<void>;

export async function findAndImportAllMigrations(
  configuration: MigrationConfiguration,
): Promise<Migration[]> {
  const migrationFilenames = await getMigrationFilenames(configuration);

  const migrations = await importAllMigrations(
    migrationFilenames,
    configuration,
  );

  return migrations;
}

async function getMigrationFilenames(
  configuration: MigrationConfiguration,
): Promise<string[]> {
  const dirEntities: Dirent[] = await fs.promises.readdir(
    configuration.migrationFilesDirectoryPath,
    {
      withFileTypes: true,
    },
  );

  const filenames = dirEntities
    .filter((dirEntity) => dirEntity.isFile())
    .map((dirEntity) => dirEntity.name)
    .sort();

  return filenames;
}

async function importAllMigrations(
  migrationFilenames: MigrationFilename[],
  configuration: MigrationConfiguration,
): Promise<Migration[]> {
  spinner.start('loading migration files');

  let migrations: Migration[];

  try {
    migrations = await Promise.all(
      migrationFilenames.map((migrationFilename) =>
        importMigration(
          path.resolve(
            configuration.migrationFilesDirectoryPath,
            migrationFilename,
          ),
        ),
      ),
    );
  } catch (error) {
    spinner.fail("couldn't load migration files");

    throw error;
  }

  spinner.succeed('migration files loaded successfully');

  return migrations;
}

export async function importMigration(
  migrationPath: MigrationFilename,
): Promise<Migration> {
  const importedMigration = await import(migrationPath);

  validateMigration(migrationPath, importedMigration);

  const migrationFilename = path.basename(migrationPath);

  const migration: Migration = {
    id: getMigrationIdFromFilename(migrationFilename),
    filename: migrationFilename,
    ...importedMigration,
  };

  return migration;
}

export function validateMigration(
  migrationFilename: MigrationFilename,
  migration: unknown,
): void {
  if (
    typeof migration !== 'object' ||
    migration === null ||
    typeof (migration as ImportedMigration).migrate !== 'function' ||
    typeof (migration as ImportedMigration).rollback !== 'function'
  ) {
    throw new MigrationError(`Invalid file ${migrationFilename}`);
  }
}

export async function createMigrationFilesDirectory(
  configuration: MigrationConfiguration,
): Promise<void> {
  try {
    await fs.promises.access(configuration.migrationFilesDirectoryPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      spinner.start('creating migration files directory');

      await fs.promises.mkdir(configuration.migrationFilesDirectoryPath, {
        recursive: true,
      });

      spinner.succeed('migration files directory created');
    } else {
      spinner.fail("couldn't create migration files directory");

      throw error;
    }
  }
}
