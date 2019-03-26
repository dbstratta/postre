import { sql } from '../queryBuilders';
import { Client, Transaction } from '../clients';

import { MigrationConfiguration } from './config';
import { getMigrationTableNameWithSchema } from './helpers';

export async function createSchemaMigrationsTableIfItDoesntExist(
  clientOrTransaction: Client | Transaction<Client>,
  configuration: MigrationConfiguration,
): Promise<void> {
  await clientOrTransaction.query(sql`
    CREATE TABLE IF NOT EXISTS ${sql.unsafeRaw(
      getMigrationTableNameWithSchema(configuration),
    )} (
      id bigint PRIMARY KEY,
      migrated_at timestamp with time zone NOT NULL
    )
  `);
}
