import MultipleRowsError from '../errors/MultipleRowsError';

import { Executor } from './executor';
import { query } from './query';

export const maybeOne: Executor<any> = async (poolOrClient, queryObject) => {
  const result = await query(poolOrClient, queryObject);

  if (result.rowCount === 0) {
    return null;
  }

  if (result.rowCount > 1) {
    throw new MultipleRowsError();
  }

  const row = result.rows[0];

  return row;
};

export default maybeOne;
