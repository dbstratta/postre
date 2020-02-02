import * as pg from 'pg';

import { BaseClient, StartTransactionOptions, TransactionFunction } from './BaseClient';
import { Transaction } from './Transaction';
import { doInTransaction, doStartTransaction } from './helpers';
import { ClientConnectionOptions } from './types';

export type ClientOptions = ClientConnectionOptions;

export class Client extends BaseClient {
  public pgClient: pg.Client;

  public constructor(options: ClientOptions) {
    super();

    this.pgClient = new pg.Client({
      host: options.databaseHost,
      port: options.databasePort,
      user: options.databaseUser,
      password: options.databaseUserPassword,
      database: options.databaseName,
      connectionString: options.databaseConnectionString,
    });
  }

  public getPgClient(): pg.Client {
    return this.pgClient;
  }

  public async startTransaction(options?: StartTransactionOptions): Promise<Transaction<any>> {
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

  public async connect(): Promise<void> {
    await this.pgClient.connect();
  }

  /**
   * Disconnects the client from the database.
   */
  public async disconnect(): Promise<void> {
    await this.pgClient.end();
  }
}

export default Client;
