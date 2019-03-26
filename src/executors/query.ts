import { makeParametizedQueryString } from '../queryBuilders';

import { Executor } from './executor';

export type QueryResult = {
  rows: Row[];
  rowCount: number;
  fields: FieldInfo[];
};

export type Row = any;

export type FieldInfo = {
  name: string;
};

export type QueryOptions = {
  rowMode?: RowMode;
};

export enum RowMode {
  Array = 'array',
  Object = 'object',
}

export const query: Executor<QueryResult> = async (
  client,
  queryObject,
  options = {},
) => {
  const queryString = makeParametizedQueryString(queryObject);

  const rawResult = await client.query({
    text: queryString,
    values: queryObject.values,
    // @ts-ignore
    rowMode: options.rowMode === RowMode.Array ? 'array' : undefined,
  });

  const result: QueryResult = {
    rows: rawResult.rows,
    rowCount: rawResult.rowCount,
    fields: rawResult.fields,
  };

  return result;
};

export default query;
