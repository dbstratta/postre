import { SqlObject } from '../queryBuilders';
import { BaseClient } from '../clients';

import { query } from './query';
import { ExecutorOptions } from './types';

export async function all<TReturn>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: ExecutorOptions,
): Promise<TReturn[]> {
  const result = await query<any>(client, sqlObject, options);

  const { rows } = result;

  return rows;
}
