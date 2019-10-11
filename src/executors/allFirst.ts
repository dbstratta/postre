import { MultipleColumnsError } from '../errors';

import { Executor } from './executor';
import { query, RowMode } from './query';

export type AllFirstQueryOptions = {};

export const allFirst: Executor<any[], AllFirstQueryOptions> = async (
  client,
  sqlObject,
  options,
) => {
  const result = await query(client, sqlObject, {
    ...options,
    rowMode: RowMode.Array,
  });

  if (result.fields.length > 1) {
    throw new MultipleColumnsError(result.fields.length);
  }

  const arrayRows = result.rows;

  const values = arrayRows.map(arrayRow => arrayRow[0]);

  return values;
};
