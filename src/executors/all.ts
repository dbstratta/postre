import { Executor } from './executor';
import { query } from './query';

export const all: Executor<any[]> = async (poolOrClient, queryObject) => {
  const result = await query(poolOrClient, queryObject);

  const { rows } = result;

  return rows;
};

export default all;
