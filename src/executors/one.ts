import { NoRowsError } from '../errors';

import { Executor } from './executor';
import { maybeOne } from './maybeOne';

export const one: Executor<any> = async (client, sqlObject, options) => {
  const row = await maybeOne(client, sqlObject, options);

  if (row === null) {
    throw new NoRowsError();
  }

  return row;
};
