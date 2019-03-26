import { sql } from '../queryBuilders';
import { Client, ClientOptions, Transaction } from '../clients';

import { migrationFilenameSeparator } from './constants';
import { MigrationConfiguration } from './config';

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
  return `"${configuration.migrationsTableSchemaName}"."${
    configuration.migrationsTableName
  }"`;
}

export function hasMigrationBeenMigrated(
  migratedMigrationIds: number[],
  migrationId: number,
): boolean {
  return migratedMigrationIds.includes(migrationId);
}
