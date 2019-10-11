import { makeParameterizedQuery } from '../queryBuilders';

import { Executor } from './executor';

export type QueryResult<TRow = any> = {
  rows: TRow[];
  rowCount: number;
  fields: FieldInfo[];
};

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

export const query: Executor<QueryResult> = async (client, sqlObjecty, options = {}) => {
  const [queryString, values] = makeParameterizedQuery(sqlObjecty);

  const rawResult = await client.query({
    text: queryString,
    values,
    rowMode: options.rowMode === RowMode.Array ? 'array' : (undefined as any),
  });

  const result: QueryResult = {
    rows: rawResult.rows,
    rowCount: rawResult.rowCount,
    fields: rawResult.fields,
  };

  return result;
};
