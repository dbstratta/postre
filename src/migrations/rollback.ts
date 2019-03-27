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
      await rollbackTo(
        transaction,
        configuration,
        args.toMigrationId,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    } else if (args.step) {
      await rollbackStep(
        transaction,
        configuration,
        args.step,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    } else {
      await rollbackAll(
        transaction,
        configuration,
        migratedMigrationIds,
        migrationTuples,
        spinner,
      );
    }
  });
}

async function rollbackTo(
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
      migrationId >= toMigrationId &&
      hasMigrationBeenMigrated(migratedMigrationIds, migrationId)
    ) {
      // eslint-disable-next-line no-await-in-loop
      await rollbackMigration(
        transaction,
        configuration,
        migrationFilename,
        migration,
        spinner,
      );
    }
  }
}

async function rollbackStep(
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

  const toMigrationId = getArrayElementOrFirst(
    migratedMigrationIds,
    migratedMigrationIds.length - step,
  );

  await rollbackTo(
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
): Promise<void> {
  const [latestMigrationFilename] = migrationTuples[0];
  const latestMigrationId = getMigrationIdFromFilename(latestMigrationFilename);

  await rollbackTo(
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

  try {
    await migration.rollback(transaction);

    await deleteFromSchemaMigrationsTable(
      transaction,
      configuration,
      migrationId,
    );
  } catch (error) {
    spinner.fail(`${redBright(migrationFilename)} failed to rollback`);

    throw error;
  }

  spinner.succeed(`${greenBright(migrationFilename)} rollbacked`);
}
