import * as pg from 'pg';

import * as executors from '../executors';
import { QueryObject } from '../queryBuilders';

import {
  IClient,
  StartTransactionOptions,
  TransactionFunction,
} from './IClient';
import { Transaction } from './Transaction';
import { doInTransaction } from './helpers';

export type PoolClientOptions = {
  pgPoolClient: pg.PoolClient;
};

export class PoolClient implements IClient {
  public pgPoolClient: pg.PoolClient;

  public constructor(options: PoolClientOptions) {
    this.pgPoolClient = options.pgPoolClient;
  }

  public oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return executors.oneFirst(this.pgPoolClient, queryObject, options);
  }

  public one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return executors.one(this.pgPoolClient, queryObject, options);
  }

  public maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return executors.maybeOne(this.pgPoolClient, queryObject, options);
  }

  public all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return executors.all(this.pgPoolClient, queryObject, options);
  }

  public query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return executors.query(this.pgPoolClient, queryObject, options);
  }

  public async startTransaction(
    options: StartTransactionOptions = {},
  ): Promise<Transaction<PoolClient>> {
    const transaction = new Transaction({
      client: this,
      isolationLevel: options.isolationLevel,
    });

    await transaction.start();

    return transaction;
  }

  public async doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn> {
    return doInTransaction(this, transactionFunction, options);
  }

  /**
   * Releases the client back to the pool.
   */
  public async release(): Promise<void> {
    await this.pgPoolClient.release();
  }
}

export default PoolClient;
