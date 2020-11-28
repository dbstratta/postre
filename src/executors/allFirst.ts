import { MultipleColumnsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { query } from './query';
import { RowMode, ExecutorOptions } from './types';

export type AllFirstQueryOptions = Pick<ExecutorOptions, 'logging'>;

export async function allFirst<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: AllFirstQueryOptions,
): Promise<TResult[]> {
  const result = await query<any>(client, sqlObject, {
    ...options,
    rowMode: RowMode.Array,
  });

  if (result.fields.length > 1) {
    throw new MultipleColumnsError(result.fields.length);
  }

  const arrayRows = result.rows;

  const values = arrayRows.map((arrayRow) => arrayRow[0]);

  return values;
}
