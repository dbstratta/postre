import * as pg from 'pg';

import { QueryObject } from '../queryBuilders';
import * as executors from '../executors';

import {
  IClient,
  StartTransactionOptions,
  TransactionFunction,
} from './IClient';
import { PoolClient } from './PoolClient';
import { Transaction } from './Transaction';
import { ClientSharedOptions } from './types';

export type PoolOptions = ClientSharedOptions & {
  /**
   * Maximum number of clients the pool can have.
   */
  maxClients: number;
  /**
   * Minimum number of clients the pool can have.
   */
  minClients: number;
  idleClientDisconnectionTimeoutInMilliseconds?: number;
};

export class Pool implements IClient {
  public pgPool: pg.Pool;

  public constructor(options: PoolOptions) {
    this.pgPool = new pg.Pool({
      host: options.databaseHost,
      port: options.databasePort,
      user: options.databaseUser,
      password: options.databaseUserPassword,
      database: options.databaseName,
      connectionString: options.databaseConnectionString,
      max: options.maxClients,
      min: options.minClients,
      idleTimeoutMillis: options.idleClientDisconnectionTimeoutInMilliseconds,
    });
  }

  public oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return executors.oneFirst(this.pgPool, queryObject, options);
  }

  public one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return executors.one(this.pgPool, queryObject, options);
  }

  public maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return executors.maybeOne(this.pgPool, queryObject, options);
  }

  public all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return executors.all(this.pgPool, queryObject, options);
  }

  public query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return executors.query(this.pgPool, queryObject, options);
  }

  public async startTransaction(
    options?: StartTransactionOptions,
  ): Promise<Transaction<PoolClient>> {
    const poolClient = await this.getPoolClient();

    const transaction = await poolClient.startTransaction(options);

    return transaction;
  }

  public async getPoolClient(): Promise<PoolClient> {
    const pgPoolClient = await this.pgPool.connect();

    const poolClient = new PoolClient({ pgPoolClient });

    return poolClient;
  }

  public async doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn> {
    const poolClient = await this.getPoolClient();

    try {
      const result = poolClient.doInTransaction(transactionFunction, options);

      return result;
    } catch (error) {
      throw error;
    } finally {
      await poolClient.release();
    }
  }
}

export default Pool;
