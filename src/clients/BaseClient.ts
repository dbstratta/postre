import * as pg from 'pg';

import { SqlObject } from '../queryBuilders';
import * as executors from '../executors';

import { Transaction } from './Transaction';

export abstract class BaseClient {
  public abstract getPgClient(): pg.Pool | pg.PoolClient | pg.Client;

  public oneFirst<TResult = any>(sqlObject: SqlObject, options?: OneFirstQueryOptions) {
    return executors.oneFirst<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public one<TResult = any>(sqlObject: SqlObject, options?: QueryOptions) {
    return executors.one<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public maybeOne<TResult = any>(sqlObject: SqlObject, options?: QueryOptions) {
    return executors.maybeOne<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public all<TResult = any>(sqlObject: SqlObject, options?: QueryOptions) {
    return executors.all<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public query<TResult = any>(sqlObject: SqlObject, options?: QueryOptions) {
    return executors.query<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public allFirst<TResult = any>(sqlObject: SqlObject, options?: AllFirstQueryOptions) {
    return executors.allFirst<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public many<TResult = any>(sqlObject: SqlObject, options?: QueryOptions) {
    return executors.many<TResult>(this.resolveClient(options), sqlObject, options);
  }

  public manyFirst<TResult = any>(sqlObject: SqlObject, options?: ManyFirstQueryOptions) {
    return executors.manyFirst<TResult>(this.resolveClient(options), sqlObject, options);
  }

  protected resolveClient(options?: ClientOverrideOption): BaseClient {
    if (options && options.client) {
      return options.client;
    }

    return this;
  }

  public abstract startTransaction(options?: StartTransactionOptions): Promise<Transaction<any>>;

  public abstract doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn>;
}

export type QueryOptions = executors.ExecutorOptions & ClientOverrideOption;

export type OneFirstQueryOptions = executors.OneFirstQueryOptions & ClientOverrideOption;

export type ManyFirstQueryOptions = executors.ManyFirstQueryOptions & ClientOverrideOption;

export type AllFirstQueryOptions = executors.AllFirstQueryOptions & ClientOverrideOption;

export type ClientOverrideOption = { client?: BaseClient };

export type StartTransactionOptions = {
  isolationLevel?: TransactionIsolationLevel;
} & ClientOverrideOption;

export type TransactionFunction<TReturn> = (transaction: Transaction<any>) => Promise<TReturn>;

export enum TransactionIsolationLevel {
  Serializable = 'SERIALIZABLE',
  RepeatableRead = 'REPEATABLE READ',
  ReadCommitted = 'READ COMMITTED',
  ReadUncommitted = 'READ UNCOMMITTED',
}

export default BaseClient;
