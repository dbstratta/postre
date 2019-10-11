import { greenBright, redBright } from 'colorette';
import ora, { Ora } from 'ora';

import { loadConfiguration, MigrationConfiguration } from '../config';
import { Transaction, Client } from '../clients';

import { MigrationId, MigrationFilename } from './types';
import {
  setupClient,
  checkIfMigrationIdIsValid,
  getMigrationIdFromFilename,
  hasMigrationBeenMigrated,
  getArrayElementOrFirst,
  makeDurationInSecondsString,
} from './helpers';
import {
  createSchemaMigrationsTableIfItDoesntExist,
  deleteFromSchemaMigrationsTable,
  lockMigrationsTable,
  getMigratedMigrationIds,
} from './schemaMigrationsTable';
import {
  findAndImportAllMigrations,
  MigrationTuple,
  Migration,
  createMigrationFilesDirectory,
} from './migrationFiles';

export type RollbackArgs =
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

export async function rollback(args: RollbackArgs): Promise<void> {
  const spinner = ora();
  const configuration = await loadConfiguration(spinner);

  await createMigrationFilesDirectory(configuration, spinner);

  const migrationTuples = await findAndImportAllMigrations(configuration, spinner);

  const client = await setupClient(configuration);

  await createSchemaMigrationsTableIfItDoesntExist(client, configuration);

  let rollbackedMigrations = 0;
  const startTimestamp = Date.now();

  try {
    await client.doInTransaction(async transaction => {
      await lockMigrationsTable(transaction, configuration);

      const migratedMigrationIds = await getMigratedMigrationIds(transaction, configuration);

      if (args.toMigrationId) {
        rollbackedMigrations = await rollbackTo(
          transaction,
          configuration,
          args.toMigrationId,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      } else if (args.step) {
        rollbackedMigrations = await rollbackStep(
          transaction,
          configuration,
          args.step,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      } else {
        rollbackedMigrations = await rollbackAll(
          transaction,
          configuration,
          migratedMigrationIds,
          migrationTuples,
          spinner,
        );
      }
    });
  } catch (error) {
    spinner.fail('no migrations were rollbacked due to an error');

    throw error;
  } finally {
    await client.disconnect();
  }

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  spinner.succeed(
    `rollbacked ${rollbackedMigrations} migrations in ${durationInSecondsString} seconds`,
  );
}

async function rollbackTo(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  toMigrationId: MigrationId,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  checkIfMigrationIdIsValid(migrationTuples, toMigrationId);

  let rollbackedMigrations = 0;
  const reversedMigrationTuples = [...migrationTuples].reverse();

  for (const [migrationFilename, migration] of reversedMigrationTuples) {
    const migrationId = getMigrationIdFromFilename(migrationFilename);

    if (
      migrationId >= toMigrationId &&
      hasMigrationBeenMigrated(migratedMigrationIds, migrationId)
    ) {
      // eslint-disable-next-line no-await-in-loop
      await rollbackMigration(transaction, configuration, migrationFilename, migration, spinner);

      rollbackedMigrations += 1;
    }
  }

  return rollbackedMigrations;
}

async function rollbackStep(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  step: number,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  if (step === 0 || migratedMigrationIds.length === 0) {
    return 0;
  }

  const toMigrationId = getArrayElementOrFirst(
    migratedMigrationIds,
    migratedMigrationIds.length - step,
  );

  return rollbackTo(
    transaction,
    configuration,
    toMigrationId,
    migratedMigrationIds,
    migrationTuples,
    spinner,
  );
}

async function rollbackAll(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<number> {
  const [latestMigrationFilename] = migrationTuples[0];
  const latestMigrationId = getMigrationIdFromFilename(latestMigrationFilename);

  return rollbackTo(
    transaction,
    configuration,
    latestMigrationId,
    migratedMigrationIds,
    migrationTuples,
    spinner,
  );
}

async function rollbackMigration(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationFilename: MigrationFilename,
  migration: Migration,
  spinner: Ora,
): Promise<void> {
  spinner.start(`rollbacking ${greenBright(migrationFilename)}`);

  const migrationId = getMigrationIdFromFilename(migrationFilename);
  const startTimestamp = Date.now();

  try {
    await migration.rollback(transaction);

    await deleteFromSchemaMigrationsTable(transaction, configuration, migrationId);
  } catch (error) {
    spinner.fail(`${redBright(migrationFilename)} failed to rollback`);

    throw error;
  }

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  spinner.succeed(
    `${greenBright(migrationFilename)} rollbacked in ${durationInSecondsString} seconds`,
  );
}
