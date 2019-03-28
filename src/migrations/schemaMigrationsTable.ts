import { MigrationConfiguration } from '../config';
import { sql } from '../queryBuilders';
import { Client, Transaction } from '../clients';

import { MigrationId } from './types';
import { getMigrationTableNameWithSchema } from './helpers';

export async function createSchemaMigrationsTableIfItDoesntExist(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<void> {
  await client.query(sql`
    CREATE TABLE IF NOT EXISTS
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    (
      id varchar(18) PRIMARY KEY,
      migrated_at timestamp with time zone NOT NULL DEFAULT now()
    )
  `);
}

export async function insertIntoSchemaMigrationsTable(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationId: MigrationId,
): Promise<void> {
  const migrationIdString = migrationId.toString();

  await client.query(sql`
    INSERT INTO
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
      (id)
    VALUES
      (${migrationIdString})
  `);
}

export async function deleteFromSchemaMigrationsTable(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationId: MigrationId,
): Promise<void> {
  const migrationIdString = migrationId.toString();

  await client.query(sql`
    DELETE FROM
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    WHERE
      id = ${migrationIdString}
  `);
}

export async function getMigratedMigrationIds(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<MigrationId[]> {
  const migrationIdStrings = await client.allFirst(sql`
    SELECT id
    FROM ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    ORDER BY
      migrated_at ASC,
      id ASC
  `);

  const migrationIds = migrationIdStrings.map(migrationIdString =>
    BigInt(migrationIdString),
  );

  return migrationIds;
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
