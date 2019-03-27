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

  const migrationTuples = await findAndImportAllMigrations(
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
        configuration,
        args.toMigrationId,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    } else if (args.step) {
      await migrateStep(
        transaction,
        configuration,
        args.step,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    } else {
      await migrateAll(
        transaction,
        configuration,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    }
  });
}

async function migrateTo(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  toMigrationId: MigrationId,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<void> {
  checkIfMigrationIdIsValid(migrationTuples, toMigrationId);

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
        configuration,
        migrationFilename,
        migration,
        spinner,
      );
    }
  }
}

async function migrateStep(
  transaction: Transaction<Client>,
  configuration: MigrationConfiguration,
  step: number,
  migratedMigrationIds: MigrationId[],
  migrationTuples: MigrationTuple[],
  spinner: Ora,
): Promise<void> {
  if (step === 0) {
    return;
  }

  const notMigratedMigrationIds = getNotMigratedMigrationIds(
    migratedMigrationIds,
    migrationTuples,
  );

  if (notMigratedMigrationIds.length === 0) {
    return;
  }

  const toMigrationId = getArrayElementOrLast(
    notMigratedMigrationIds,
    step - 1,
  );

  await migrateTo(
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
): Promise<void> {
  const [latestMigrationFilename] = migrationTuples[migrationTuples.length - 1];
  const latestMigrationId = getMigrationIdFromFilename(latestMigrationFilename);

  await migrateTo(
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

  try {
    await migration.migrate(transaction);

    await insertIntoSchemaMigrationsTable(
      transaction,
      configuration,
      migrationId,
    );
  } catch (error) {
    spinner.fail(`${redBright(migrationFilename)} failed to migrate`);

    throw error;
  }

  spinner.succeed(`${greenBright(migrationFilename)} migrated`);
}
