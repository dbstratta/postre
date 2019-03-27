import { sql } from '../queryBuilders';
import { Client, Transaction } from '../clients';
import { MigrationConfiguration } from '../config';

import { getMigrationTableNameWithSchema } from './helpers';

export async function createSchemaMigrationsTableIfItDoesntExist(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<void> {
  await client.query(sql`
    CREATE TABLE IF NOT EXISTS
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    (
      id bigint PRIMARY KEY,
      migrated_at timestamp with time zone NOT NULL DEFAULT now()
    )
  `);
}

export async function insertIntoSchemaMigrationsTable(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationId: number,
): Promise<void> {
  await client.query(sql`
    INSERT INTO
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
      (id)
    VALUES
      (${migrationId})
  `);
}

export async function deleteFromSchemaMigrationsTable(
  client: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
  migrationId: number,
): Promise<void> {
  await client.query(sql`
    DELETE FROM
      ${sql.unsafeRaw(getMigrationTableNameWithSchema(configuration))}
    WHERE
      id = ${migrationId}
  `);
}
