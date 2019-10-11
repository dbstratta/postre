import * as pg from 'pg';

import { SqlObject } from '../queryBuilders';
import * as executors from '../executors';

import { Transaction } from './Transaction';

// prettier-ignore
export abstract class BaseClient {
  public abstract getPgClient(): pg.Pool | pg.PoolClient | pg.Client;

  public oneFirst(
    sqlObject: SqlObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return executors.oneFirst(this.getPgClient(), sqlObject, options);
  }

  public one(
    sqlObject: SqlObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return executors.one(this.getPgClient(), sqlObject, options);
  }

  public maybeOne(
    sqlObject: SqlObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return executors.maybeOne(this.getPgClient(), sqlObject, options);
  }

  public all(
    sqlObject: SqlObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return executors.all(this.getPgClient(), sqlObject, options);
  }

  public query(
    sqlObject: SqlObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return executors.query(this.getPgClient(), sqlObject, options);
  }

  public allFirst(
    sqlObject: SqlObject,
    options?: executors.AllFirstQueryOptions,
  ): ReturnType<typeof executors.allFirst> {
    return executors.allFirst(this.getPgClient(), sqlObject, options);
  }

  public many(
    sqlObject: SqlObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.many> {
    return executors.many(this.getPgClient(), sqlObject, options);
  }

  public manyFirst(
    sqlObject: SqlObject,
    options?: executors.ManyFirstQueryOptions,
  ): ReturnType<typeof executors.manyFirst> {
    return executors.manyFirst(this.getPgClient(), sqlObject, options);
  }

  public abstract startTransaction(options?: StartTransactionOptions): Promise<BaseClient>;

  public abstract doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn>;
}

export type StartTransactionOptions = {
  isolationLevel?: TransactionIsolationLevel;
};

export type TransactionFunction<TReturn> = (transaction: Transaction<any>) => Promise<TReturn>;

export enum TransactionIsolationLevel {
  Serializable = 'SERIALIZABLE',
  RepeatableRead = 'REPEATABLE READ',
  ReadCommitted = 'READ COMMITTED',
  ReadUncommitted = 'READ UNCOMMITTED',
}

export default BaseClient;
