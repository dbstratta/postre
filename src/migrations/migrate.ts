import ora, { Ora } from 'ora';
import { greenBright, redBright } from 'colorette';

import { Transaction, Client } from '../clients';

import { loadConfiguration } from './config';
import { createSchemaMigrationsTableIfItDoesntExist } from './schemaMigrationsTable';
import {
  getMigratedMigrationIds,
  setupClient,
  lockMigrationsTable,
  getMigrationIdFromFilename,
  hasMigrationBeenMigrated,
} from './helpers';
import {
  getMigrationFilenames,
  Migration,
  importAllMigrations,
  MigrationTuple,
} from './migrationFiles';

export type MigrateArgs =
  | {
      toMigrationId: number;
      step?: undefined;
    }
  | {
      step: number;
      toMigrationId?: undefined;
    }
  | {
      step?: undefined;
      toMigrationId?: undefined;
    };

export async function migrate(args: MigrateArgs): Promise<void> {
  const spinner = ora();

  const configuration = await loadConfiguration(spinner);

  const migrationFilenames = await getMigrationFilenames(configuration);
  const migrationTuples = await importAllMigrations(
    migrationFilenames,
    configuration,
    spinner,
  );

  const client = await setupClient(configuration);

  await createSchemaMigrationsTableIfItDoesntExist(client, configuration);

  client.doInTransaction(async transaction => {
    await lockMigrationsTable(transaction, configuration);

    const migratedMigrationIds = await getMigratedMigrationIds(
      transaction,
      configuration,
    );

    if (args.toMigrationId) {
      await migrateTo(
        transaction,
        args.toMigrationId,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    } else {
      await migrateToLatest(
        transaction,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    }
  });
}

async function migrateTo(
  transaction: Transaction<Client>,
  toMigrationId: number,
  migratedMigrationIds: number[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<void> {
  // eslint-disable-next-line fp/no-loops, no-restricted-syntax
  for (const [migrationFilename, migration] of migrationTuples) {
    const migrationId = getMigrationIdFromFilename(migrationFilename);

    if (
      migrationId <= toMigrationId &&
      !hasMigrationBeenMigrated(migratedMigrationIds, migrationId)
    ) {
      // eslint-disable-next-line no-await-in-loop
      await migrateMigration(
        transaction,
        migrationFilename,
        migration,
        spinner,
      );
    }
  }
}

async function migrateToLatest(
  transaction: Transaction<Client>,
  migratedMigrationIds: number[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<void> {
  const latestMigrationFilename =
    migrationTuples[migrationTuples.length - 1][0];
  const latestMigrationId = getMigrationIdFromFilename(latestMigrationFilename);

  await migrateTo(
    transaction,
    latestMigrationId,
    migratedMigrationIds,
    migrationTuples,
    spinner,
  );
}

async function migrateMigration(
  transaction: Transaction<Client>,
  migrationFilename: string,
  migration: Migration,
  spinner: Ora,
): Promise<void> {
  spinner.start(`Migrating ${greenBright(migrationFilename)}`);

  try {
    await migration.up(transaction);
  } catch (error) {
    spinner.fail(`${redBright(migrationFilename)} failed`);

    throw error;
  }

  spinner.succeed(`${greenBright(migrationFilename)} migrated`);
}
