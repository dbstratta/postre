import path from 'path';
import { promises as fs, Dirent } from 'fs';

import { Ora } from 'ora';

import { Client, Transaction } from '../clients';
import { MigrationError } from '../errors';

import { MigrationConfiguration } from './config';

export type MigrationTuple = [string, Migration];

export type Migration = {
  up: MigrationFunction;
  down: MigrationFunction;
};

export type MigrationFunction = (
  client: Client | Transaction<Client>,
) => Promise<void>;

export async function getMigrationFilenames(
  configuration: MigrationConfiguration,
): Promise<string[]> {
  const dirEntities: Dirent[] = await fs.readdir(
    configuration.migrationFilesDirectoryPath,
    // @ts-ignore
    { withFileTypes: true },
  );

  // eslint-disable-next-line fp/no-mutating-methods
  const filenames = dirEntities
    .filter(dirEntity => dirEntity.isFile())
    .map(dirEntity => dirEntity.name)
    .sort();

  return filenames;
}

export function findMigrationFilename(
  migrationId: number,
  migrationFilenames: string[],
): string | null {
  const foundMigrationFilename = migrationFilenames.find(migrationFilename =>
    migrationFilename.startsWith(migrationId.toString()),
  );

  if (!foundMigrationFilename) {
    return null;
  }

  return foundMigrationFilename;
}

export async function importAllMigrations(
  migrationFilenames: string[],
  configuration: MigrationConfiguration,
  spinner: Ora,
): Promise<MigrationTuple[]> {
  spinner.start('Loading migration files');

  let migrationTuples: MigrationTuple[];

  try {
    migrationTuples = await Promise.all(
      migrationFilenames.map(
        async migrationFilename =>
          [
            migrationFilename,
            await importMigration(
              path.resolve(
                configuration.migrationFilesDirectoryPath,
                migrationFilename,
              ),
            ),
          ] as MigrationTuple,
      ),
    );
  } catch (error) {
    spinner.fail("Couldn't load migration files");

    throw error;
  }

  spinner.succeed('Migration files loaded successfully');

  return migrationTuples;
}

export async function importMigration(
  migrationFilename: string,
): Promise<Migration> {
  const migration = await import(migrationFilename);

  validateMigration(migrationFilename, migration);

  return migration;
}

export function validateMigration(
  migrationFilename: string,
  migration: Migration,
): void {
  if (
    typeof migration !== 'object' ||
    typeof migration.up !== 'function' ||
    typeof migration.down !== 'function'
  ) {
    throw new MigrationError(`Invalid file ${migrationFilename}`);
  }
}
