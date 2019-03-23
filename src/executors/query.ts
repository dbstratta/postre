import { makeParametizedQueryString } from '../queryBuilders';

import { Executor } from './executor';

export type QueryResult = {
  rows: any[];
  rowCount: number;
};

export const query: Executor<QueryResult> = async (
  poolOrClient,
  queryObject,
) => {
  const queryString = makeParametizedQueryString(queryObject);

  const rawResult = await poolOrClient.query(queryString, queryObject.values);

  const result: QueryResult = {
    rows: rawResult.rows,
    rowCount: rawResult.rowCount,
  };

  return result;
};

export default query;
