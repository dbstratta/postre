import NoRowsError from '../errors/NoRowsError';
import MultipleRowsError from '../errors/MultipleRowsError';

import { Executor } from './executor';
import { query } from './query';

export const one: Executor<any> = async (poolOrClient, queryObject) => {
  const result = await query(poolOrClient, queryObject);

  if (result.rowCount < 1) {
    throw new NoRowsError();
  }

  if (result.rowCount > 1) {
    throw new MultipleRowsError();
  }

  const row = result.rows[0];

  return row;
};

export default one;
