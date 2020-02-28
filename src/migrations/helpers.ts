import { Client, ClientOptions } from '../clients';
import { MigrationError } from '../errors';
import { MigrationConfiguration } from '../config';

import { MigrationFilename, MigrationId } from './types';
import { migrationFilenameSeparator } from './constants';
import { Migration } from './migrationFiles';

export function getMigrationIdFromFilename(migrationFilename: MigrationFilename): MigrationId {
  const migrationId = BigInt(migrationFilename.split(migrationFilenameSeparator)[0]);

  return migrationId;
}

export async function setupClient(configuration: MigrationConfiguration): Promise<Client> {
  let clientOptions: ClientOptions;

  if (configuration.databaseConnectionString !== undefined) {
    clientOptions = {
      databaseConnectionString: configuration.databaseConnectionString,
    };
  } else {
    clientOptions = {
      databaseHost: configuration.databaseHost,
      databasePort: configuration.databasePort,
      databaseName: configuration.databaseName,
      databaseUser: configuration.databaseUser,
      databaseUserPassword: configuration.databaseUserPassword,
    };
  }

  const client = new Client(clientOptions);

  await client.connect();

  return client;
}

export function getMigrationTableNameWithSchema(configuration: MigrationConfiguration): string {
  return `"${configuration.migrationsTableSchema}"."${configuration.migrationsTableName}"`;
}

export function hasMigrationBeenMigrated(
  migratedMigrationIds: MigrationId[],
  migrationId: MigrationId,
): boolean {
  return migratedMigrationIds.includes(migrationId);
}

export function getNotMigratedMigrationIds(
  migratedMigrationIds: MigrationId[],
  migrations: Migration[],
): MigrationId[] {
  const notMigratedMigrationIds = migrations
    .map(migration => getMigrationIdFromFilename(migration.filename))
    .filter(migrationId => !migratedMigrationIds.includes(migrationId));

  return notMigratedMigrationIds;
}

export function getArrayElementOrLast<TElement>(array: TElement[], index: number): TElement {
  if (index >= array.length) {
    return array[array.length - 1];
  }

  return array[index];
}

export function getArrayElementOrFirst<TElement>(array: TElement[], index: number): TElement {
  if (index < 0) {
    return array[0];
  }

  return array[index];
}

export function checkIfMigrationIdIsValid(migrations: Migration[], migrationId: MigrationId): void {
  if (!isMigrationIdValid(migrations, migrationId)) {
    throw new MigrationError(`Couldn't find migration with id ${migrationId}`);
  }
}

export function isMigrationIdValid(migrations: Migration[], migrationId: MigrationId): boolean {
  return migrations
    .map(migration => getMigrationIdFromFilename(migration.filename))
    .includes(migrationId);
}

export function makeDurationInSecondsString(
  startTimestamp: number,
  finishTimestamp: number,
): string {
  const durationInSecondsString = ((finishTimestamp - startTimestamp) / 1000).toFixed(2);

  return durationInSecondsString;
}
