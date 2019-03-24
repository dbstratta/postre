import { NoRowsError } from '../errors';

import { Executor } from './executor';
import { maybeOne } from './maybeOne';

export const one: Executor<any> = async (client, queryObject, options) => {
  const row = await maybeOne(client, queryObject, options);

  if (row === null) {
    throw new NoRowsError();
  }

  return row;
};

export default one;
