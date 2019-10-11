import { NoRowsError } from '../errors';

import { Executor } from './executor';
import { all } from './all';

export const many: Executor<any[]> = async (client, sqlObject, options) => {
  const rows = await all(client, sqlObject, options);

  if (rows.length === 0) {
    throw new NoRowsError();
  }

  return rows;
};
