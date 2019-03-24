import * as pg from 'pg';

import {
  BaseClient,
  StartTransactionOptions,
  TransactionFunction,
} from './BaseClient';
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

export type PoolConfig = {
  maxClients: number;
  minClients: number;
};

export class Pool extends BaseClient {
  public config: PoolConfig;

  public pgPool: pg.Pool;

  public constructor(options: PoolOptions) {
    super();

    this.config = {
      maxClients: options.maxClients,
      minClients: options.minClients,
    };

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

  public getPgClient(): pg.Pool {
    return this.pgPool;
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

  /**
   * Returns the total count of clients in the pool.
   */
  public getTotalClientCount(): number {
    return this.pgPool.totalCount;
  }

  /**
   * Returns the count of clients in the pool
   * that are currently idle.
   */
  public getIdleClientCount(): number {
    return this.pgPool.idleCount;
  }

  /**
   * Returns the count of clients in the pool
   * that are currently being used.
   */
  public getWorkingClientCount(): number {
    return this.getTotalClientCount() - this.getIdleClientCount();
  }

  /**
   * Returns the count of queries that are waiting
   * for a client to be released.
   */
  public getPendingQueryCount(): number {
    return this.pgPool.waitingCount;
  }
}

export default Pool;
