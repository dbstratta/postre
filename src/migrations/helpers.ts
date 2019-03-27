import { sql } from '../queryBuilders';
import { Client, ClientOptions, Transaction } from '../clients';
import { MigrationError } from '../errors';
import { MigrationConfiguration } from '../config';

import { migrationFilenameSeparator } from './constants';
import { MigrationTuple } from './migrationFiles';

export function getMigrationIdFromFilename(migrationFilename: string): number {
  const migrationId = parseInt(
    migrationFilename.split(migrationFilenameSeparator)[0],
    10,
  );

  return migrationId;
}

export async function getMigratedMigrationIds(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<number[]> {
  const migrationIds = await client.allFirst(sql`
    SELECT id
    FROM ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    ORDER BY
      migrated_at DESC,
      id DESC
  `);

  return migrationIds;
}

export async function setupClient(
  configuration: MigrationConfiguration,
): Promise<Client> {
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

export async function lockMigrationsTable(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<void> {
  await client.query(sql`
    LOCK TABLE ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
      IN ACCESS EXCLUSIVE MODE
      NOWAIT
  `);
}

export function getMigrationTableNameWithSchema(
  configuration: MigrationConfiguration,
): string {
  return `"${configuration.migrationsTableSchema}"."${
    configuration.migrationsTableName
  }"`;
}

export function hasMigrationBeenMigrated(
  migratedMigrationIds: number[],
  migrationId: number,
): boolean {
  return migratedMigrationIds.includes(migrationId);
}

export function getNotMigratedMigrationIds(
  migratedMigrationIds: number[],
  migrationTuples: MigrationTuple[],
): number[] {
  const notMigratedMigrationIds = migrationTuples
    .map(([migrationFilename]) => getMigrationIdFromFilename(migrationFilename))
    .filter(migrationId => !migratedMigrationIds.includes(migrationId));

  return notMigratedMigrationIds;
}

export function getArrayElementOrLast<TElement>(
  array: TElement[],
  index: number,
): TElement {
  if (index >= array.length) {
    return array[array.length - 1];
  }

  return array[index];
}

export function getArrayElementOrFirst<TElement>(
  array: TElement[],
  index: number,
): TElement {
  if (index < 0) {
    return array[0];
  }

  return array[index];
}

export function checkIfMigrationIdIsValid(
  migrationTuples: MigrationTuple[],
  migrationId: number,
): void {
  if (!isMigrationIdValid(migrationTuples, migrationId)) {
    throw new MigrationError(`Couldn't find migration with id ${migrationId}`);
  }
}

export function isMigrationIdValid(
  migrationTuples: MigrationTuple[],
  migrationId: number,
): boolean {
  return migrationTuples
    .map(([migrationFilename]) => getMigrationIdFromFilename(migrationFilename))
    .includes(migrationId);
}
