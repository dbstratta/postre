import { MultipleColumnsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { one } from './one';
import { RowMode, ExecutorOptions } from './types';

export type OneFirstQueryOptions = Pick<ExecutorOptions, 'logging'>;

export async function oneFirst<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: OneFirstQueryOptions,
): Promise<TResult> {
  const arrayRow = await one<any>(client, sqlObject, {
    ...options,
    rowMode: RowMode.Array,
  });

  if (arrayRow.length > 1) {
    throw new MultipleColumnsError(arrayRow.length);
  }

  const value = arrayRow[0];

  return value;
}
