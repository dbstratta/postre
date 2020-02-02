import { NoRowsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { allFirst } from './allFirst';
import { ExecutorOptions } from './types';

export type ManyFirstQueryOptions = {} & Pick<ExecutorOptions, 'logging'>;

export async function manyFirst<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: ManyFirstQueryOptions,
): Promise<TResult[]> {
  const rows = await allFirst<TResult>(client, sqlObject, options);

  if (rows.length === 0) {
    throw new NoRowsError();
  }

  return rows;
}
