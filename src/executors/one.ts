import { NoRowsError } from '../errors';
import { BaseClient } from '../clients';
import { SqlObject } from '../queryBuilders';

import { maybeOne } from './maybeOne';
import { ExecutorOptions } from './types';

export async function one<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options?: ExecutorOptions,
): Promise<TResult> {
  const row = await maybeOne<TResult>(client, sqlObject, options);

  if (row === null) {
    throw new NoRowsError();
  }

  return row;
}
