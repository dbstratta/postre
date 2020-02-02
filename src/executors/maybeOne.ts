import { MultipleRowsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { all } from './all';
import { ExecutorOptions } from './types';

export async function maybeOne<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: ExecutorOptions,
): Promise<TResult | null> {
  const rows = await all<TResult>(client, sqlObject, options);

  if (rows.length === 0) {
    return null;
  }

  if (rows.length > 1) {
    throw new MultipleRowsError(rows.length);
  }

  const row = rows[0];

  return row;
}
