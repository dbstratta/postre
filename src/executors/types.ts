import { QueryString, QueryValue } from '../queryBuilders';

export type ExecutorOptions = {
  rowMode?: RowMode;
  logging?: ExecutorLogging;
};

export enum RowMode {
  Array = 'array',
  Object = 'object',
}

export type ExecutorLogging = QueryLoggerFunction | undefined;

export type QueryLoggerFunction = (queryString: QueryString, queryValues: QueryValue[]) => void;
