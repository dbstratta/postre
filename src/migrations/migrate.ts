import { greenBright, redBright } from 'colorette';
import ora, { Ora } from 'ora';

import { loadConfiguration, MigrationConfiguration } from '../config';
import { Transaction, Client } from '../clients';

import { MigrationId, MigrationFilename } from './types';
import {
  setupClient,
  getMigrationIdFromFilename,
  hasMigrationBeenMigrated,
  getNotMigratedMigrationIds,
  getArrayElementOrLast,
  checkIfMigrationIdIsValid,
  makeDurationInSecondsString,
} from './helpers';
import {
  createSchemaMigrationsTableIfItDoesntExist,
  insertIntoSchemaMigrationsTable,
  lockMigrationsTable,
  getMigratedMigrationIds,
} from './schemaMigrationsTable';
import {
  Migration,
  MigrationTuple,
  findAndImportAllMigrations,
  createMigrationFilesDirectory,
} from './migrationFiles';

export type MigrateArgs =
  | {
      toMigrationId: MigrationId;
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

  await createMigrationFilesDirectory(configuration, spinner);

  const migrationTuples = await findAndImportAllMigrations(configuration, spinner);

  const client = await setupClient(configuration);

  await createSchemaMigrationsTableIfItDoesntExist(client, configuration);

  let migrationsMigrated = 0;
  const startTimestamp = Date.now();

  try {
    await client.doInTransaction(async transaction => {
      await lockMigrationsTable(transaction, configuration);

      const migratedMigrationIds = await getMigratedMigrationIds(transaction, configuration);

      if (args.toMigrationId) {
        migrationsMigrated = await migrateTo(
          transaction,
          configuration,
          args.toMigrationId,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      } else if (args.step) {
        migrationsMigrated = await migrateStep(
          transaction,
          configuration,
          args.step,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      } else {
        migrationsMigrated = await migrateAll(
          transaction,
          configuration,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      }
    });
  } catch (error) {
    spinner.fail('no migrations were migrated due to an error');

    throw error;
  } finally {
    await client.disconnect();
  }

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  spinner.succeed(
    `migrated ${migrationsMigrated} migrations in ${durationInSecondsString} seconds`,
  );
}

async function migrateTo(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  toMigrationId: MigrationId,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  checkIfMigrationIdIsValid(migrationTuples, toMigrationId);

  let migratedMigrations = 0;

  for (const [migrationFilename, migration] of migrationTuples) {
    const migrationId = getMigrationIdFromFilename(migrationFilename);

    if (
      migrationId <= toMigrationId &&
      !hasMigrationBeenMigrated(migratedMigrationIds, migrationId)
    ) {
      // eslint-disable-next-line no-await-in-loop
      await migrateMigration(transaction, configuration, migrationFilename, migration, spinner);

      migratedMigrations += 1;
    }
  }

  return migratedMigrations;
}

async function migrateStep(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  step: number,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  const notMigratedMigrationIds = getNotMigratedMigrationIds(migratedMigrationIds, migrationTuples);

  if (step === 0 || notMigratedMigrationIds.length === 0) {
    return 0;
  }

  const toMigrationId = getArrayElementOrLast(notMigratedMigrationIds, step - 1);

  return migrateTo(
    transaction,
    configuration,
    toMigrationId,
    migratedMigrationIds,
    migrationTuples,
    spinner,
  );
}

async function migrateAll(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  const [latestMigrationFilename] = migrationTuples[migrationTuples.length - 1];
  const latestMigrationId = getMigrationIdFromFilename(latestMigrationFilename);

  return migrateTo(
    transaction,
    configuration,
    latestMigrationId,
    migratedMigrationIds,
    migrationTuples,
    spinner,
  );
}

async function migrateMigration(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationFilename: MigrationFilename,
  migration: Migration,
  spinner: Ora,
): Promise<void> {
  spinner.start(`migrating ${greenBright(migrationFilename)}`);

  const migrationId = getMigrationIdFromFilename(migrationFilename);
  const startTimestamp = Date.now();

  try {
    await migration.migrate(transaction);

    await insertIntoSchemaMigrationsTable(transaction, configuration, migrationId);
  } catch (error) {
    spinner.fail(`${redBright(migrationFilename)} failed to migrate`);

    throw error;
  }

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  spinner.succeed(
    `${greenBright(migrationFilename)} migrated in ${durationInSecondsString} seconds`,
  );
}
