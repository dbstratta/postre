import { MultipleColumnsError } from '../errors';

import { Executor } from './executor';
import { one } from './one';
import { RowMode } from './query';

export type OneFirstQueryOptions = {};

export const oneFirst: Executor<any, OneFirstQueryOptions> = async (client, sqlObject, options) => {
  const arrayRow = await one(client, sqlObject, {
    ...options,
    rowMode: RowMode.Array,
  });

  if (arrayRow.length > 1) {
    throw new MultipleColumnsError(arrayRow.length);
  }

  const value = arrayRow[0];

  return value;
};
