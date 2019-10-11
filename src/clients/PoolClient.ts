import * as pg from 'pg';

import { BaseClient, StartTransactionOptions, TransactionFunction } from './BaseClient';
import { Transaction } from './Transaction';
import { doInTransaction } from './helpers';

export type PoolClientOptions = {
  pgPoolClient: pg.PoolClient;
};

export class PoolClient extends BaseClient {
  public pgPoolClient: pg.PoolClient;

  public constructor(options: PoolClientOptions) {
    super();

    this.pgPoolClient = options.pgPoolClient;
  }

  public getPgClient(): pg.PoolClient {
    return this.pgPoolClient;
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
