import { NoRowsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { all } from './all';
import { ExecutorOptions } from './types';

export async function many<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: ExecutorOptions,
): Promise<TResult[]> {
  const rows = await all<TResult>(client, sqlObject, options);

  if (rows.length === 0) {
    throw new NoRowsError();
  }

  return rows;
}
