import * as pg from 'pg';

import {
  BaseClient,
  StartTransactionOptions,
  TransactionFunction,
} from './BaseClient';
import { Transaction } from './Transaction';
import { doInTransaction, doStartTransaction } from './helpers';

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
    options?: StartTransactionOptions,
  ): Promise<Transaction<any>> {
    if (options && options.client) {
      const { client, ...restOfOptions } = options;

      return client.startTransaction(restOfOptions);
    }

    const transaction = await doStartTransaction(this, options);

    return transaction;
  }

  public async doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn> {
    if (options && options.client) {
      const { client, ...restOfOptions } = options;

      return client.doInTransaction(transactionFunction, restOfOptions);
    }

    return doInTransaction(this, transactionFunction, options);
  }

  /**
   * Releases the client back to the pool.
   */
  public release(): void {
    this.pgPoolClient.release();
  }
}

export default PoolClient;
