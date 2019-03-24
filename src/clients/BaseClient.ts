import * as pg from 'pg';

import { QueryObject } from '../queryBuilders';
import * as executors from '../executors';

import { Transaction } from './Transaction';

export abstract class BaseClient {
  public abstract getPgClient(): pg.Pool | pg.PoolClient | pg.Client;

  public oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return executors.oneFirst(this.getPgClient(), queryObject, options);
  }

  public one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return executors.one(this.getPgClient(), queryObject, options);
  }

  public maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return executors.maybeOne(this.getPgClient(), queryObject, options);
  }

  public all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return executors.all(this.getPgClient(), queryObject, options);
  }

  public query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return executors.query(this.getPgClient(), queryObject, options);
  }

  public abstract startTransaction(
    options?: StartTransactionOptions,
  ): Promise<BaseClient>;

  public abstract doInTransaction<TReturn>(
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

export default BaseClient;
