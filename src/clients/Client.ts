import * as pg from 'pg';

import {
  BaseClient,
  StartTransactionOptions,
  TransactionFunction,
} from './BaseClient';
import { Transaction } from './Transaction';
import { doInTransaction } from './helpers';

export type ClientOptions = {};

export class Client extends BaseClient {
  public pgClient: pg.Client;

  public constructor(options: ClientOptions) {
    super();

    this.pgClient = new pg.Client();
  }

  public getPgClient(): pg.Client {
    return this.pgClient;
  }

  public async startTransaction(
    options: StartTransactionOptions = {},
  ): Promise<Transaction<Client>> {
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
}

export default Client;
