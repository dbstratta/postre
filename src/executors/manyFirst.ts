import { NoRowsError } from '../errors';

import { Executor } from './executor';
import { allFirst } from './allFirst';

export type ManyFirstQueryOptions = {};

export const manyFirst: Executor<any[], ManyFirstQueryOptions> = async (
  client,
  sqlObject,
  options,
) => {
  const rows = await allFirst(client, sqlObject, options);

  if (rows.length === 0) {
    throw new NoRowsError();
  }

  return rows;
};
