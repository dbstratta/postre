import { greenBright, redBright } from 'colorette';

import { loadConfiguration, MigrationConfiguration } from '../config';
import { Client } from '../clients';
import { spinner } from '../helpers';

import { MigrationId } from './types';
import {
  setupClient,
  hasMigrationBeenMigrated,
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
  findAndImportAllMigrations,
  createMigrationFilesDirectory,
} from './migrationFiles';

export type MigrateArgs = {
  toMigrationId?: MigrationId;
};

export async function migrate(args: MigrateArgs): Promise<void> {
  const configuration = await loadConfiguration();

  await createMigrationFilesDirectory(configuration);

  const migrations = await findAndImportAllMigrations(configuration);

  const schemaMigrationsTableClient = await setupClient(configuration);

  await createSchemaMigrationsTableIfItDoesntExist(schemaMigrationsTableClient, configuration);

  let migrationsClient: Client | undefined = undefined;

  let migrationsMigrated = 0;
  const startTimestamp = Date.now();

  try {
    migrationsClient = await setupClient(configuration);

    if (args.toMigrationId) {
      migrationsMigrated = await migrateTo(
        migrationsClient,
        schemaMigrationsTableClient,
        configuration,
        args.toMigrationId,
        migrations,
      );
    } else {
      migrationsMigrated = await migrateAll(
        migrationsClient,
        schemaMigrationsTableClient,
        configuration,
        migrations,
      );
    }
  } catch (error) {
    spinner.fail('no migrations were migrated due to an error');

    throw error;
  } finally {
    if (migrationsClient) {
      await migrationsClient.disconnect();
    }

    await schemaMigrationsTableClient.disconnect();
  }

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  spinner.succeed(
    `migrated ${migrationsMigrated} migrations in ${durationInSecondsString} seconds`,
  );
}

async function migrateTo(
  migrationsClient: Client,
  schemaMigrationsTableClient: Client,
  configuration: MigrationConfiguration,
  toMigrationId: MigrationId,
  migrations: Migration[],
): Promise<number> {
  checkIfMigrationIdIsValid(migrations, toMigrationId);

  let migratedMigrations = 0;

  for (const migration of migrations) {
    if (migration.id <= toMigrationId) {
      const wasMigrated = await migrateMigration(
        migrationsClient,
        schemaMigrationsTableClient,
        configuration,
        migration,
      );

      if (wasMigrated) {
        migratedMigrations += 1;
      }
    }
  }

  return migratedMigrations;
}

async function migrateAll(
  migrationsClient: Client,
  schemaMigrationsTableClient: Client,
  configuration: MigrationConfiguration,
  migrations: Migration[],
): Promise<number> {
  const latestMigration = migrations[migrations.length - 1];

  return migrateTo(
    migrationsClient,
    schemaMigrationsTableClient,
    configuration,
    latestMigration.id,
    migrations,
  );
}

async function migrateMigration(
  migrationsClient: Client,
  schemaMigrationsTableClient: Client,
  configuration: MigrationConfiguration,
  migration: Migration,
): Promise<boolean> {
  spinner.start(`migrating ${greenBright(migration.filename)}`);

  const startTimestamp = Date.now();

  const wasMigrated = await schemaMigrationsTableClient.doInTransaction(
    async schemaMigrationsTableTransaction => {
      await lockMigrationsTable(schemaMigrationsTableTransaction, configuration);

      const migratedMigrationIds = await getMigratedMigrationIds(
        schemaMigrationsTableTransaction,
        configuration,
      );

      if (hasMigrationBeenMigrated(migratedMigrationIds, migration.id)) {
        return false;
      }

      try {
        if (migration.disableTransaction) {
          await migration.migrate(migrationsClient);
        } else {
          await migrationsClient.doInTransaction(async transaction => {
            await migration.migrate(transaction);
          });
        }
      } catch (error) {
        spinner.fail(`${redBright(migration.filename)} failed to migrate`);

        throw error;
      }

      await insertIntoSchemaMigrationsTable(
        schemaMigrationsTableTransaction,
        configuration,
        migration.id,
      );

      return true;
    },
  );

  const finishTimestamp = Date.now();
  const durationInSecondsString = makeDurationInSecondsString(startTimestamp, finishTimestamp);

  if (wasMigrated) {
    spinner.succeed(
      `${greenBright(migration.filename)} migrated in ${durationInSecondsString} seconds`,
    );
  }

  return wasMigrated;
}
