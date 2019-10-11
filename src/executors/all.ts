import { Executor } from './executor';
import { query } from './query';

export const all: Executor<any[]> = async (client, sqlObject, options) => {
  const result = await query(client, sqlObject, options);

  const { rows } = result;

  return rows;
};
