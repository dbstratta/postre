import { Executor } from './executor';
import { query } from './query';

export const all: Executor<any[]> = async (client, queryObject, options) => {
  const result = await query(client, queryObject, options);

  const { rows } = result;

  return rows;
};

export default all;
