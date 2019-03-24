import { QueryObject } from '../queryBuilders';
import * as executors from '../executors';

import { Transaction } from './Transaction';

export interface IClient {
  oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst>;
  one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one>;
  maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne>;
  all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all>;
  query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query>;

  startTransaction(options?: StartTransactionOptions): Promise<IClient>;

  doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn>;
}

export type StartTransactionOptions = {
  isolationLevel?: TransactionIsolationLevel;
};

export type TransactionFunction<TReturn> = (
  transaction: Transaction<any>,
) => Promise<TReturn>;

// TODO: replace string literals for the ones in `sqlTokens` when TS reaches 3.4
// as we'll be able to use `as const` on it.
export enum TransactionIsolationLevel {
  Serializable = 'SERIALIZABLE',
  RepeatableRead = 'REPEATABLE',
  ReadCommitted = 'READ COMMITTED',
  ReadUncommitted = 'READ UNCOMMITTED',
}

export default IClient;
