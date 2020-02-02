import { makeParameterizedQuery, SqlObject, QueryValue, QueryString } from '../queryBuilders';
import { BaseClient } from '../clients';

import { ExecutorOptions, RowMode, ExecutorLogging } from './types';

export type QueryResult<TRow> = {
  rows: TRow[];
  rowCount: number;
  fields: FieldInfo[];
};

export type FieldInfo = {
  name: string;
};

export async function query<TResult>(
  client: BaseClient,
  sqlObject: SqlObject,
  options: ExecutorOptions = {},
): Promise<QueryResult<TResult>> {
  const [queryString, values] = makeParameterizedQuery(sqlObject);

  maybeLog(queryString, values, options.logging);

  const rawResult = await client.getPgClient().query({
    text: queryString,
    values,
    rowMode: options.rowMode === RowMode.Array ? RowMode.Array : (undefined as any),
  });

  const result: QueryResult<TResult> = {
    rows: rawResult.rows as any,
    rowCount: rawResult.rowCount,
    fields: rawResult.fields,
  };

  return result;
}

function maybeLog(
  queryString: QueryString,
  queryValues: QueryValue[],
  logging: ExecutorLogging,
): void {
  if (typeof logging === 'function') {
    logging(queryString, queryValues);
  }
}
