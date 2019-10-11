import { MultipleRowsError } from '../errors';

import { Executor } from './executor';
import { all } from './all';

export const maybeOne: Executor<any> = async (client, sqlObject, options) => {
  const rows = await all(client, sqlObject, options);

  if (rows.length === 0) {
    return null;
  }

  if (rows.length > 1) {
    throw new MultipleRowsError(rows.length);
  }

  const row = rows[0];

  return row;
};
