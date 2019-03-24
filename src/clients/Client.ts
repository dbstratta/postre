import * as pg from 'pg';

import { QueryObject } from '../queryBuilders';
import * as executors from '../executors';

import {
  IClient,
  StartTransactionOptions,
  TransactionFunction,
} from './IClient';
import { Transaction } from './Transaction';
import { doInTransaction } from './helpers';

export type ClientOptions = {};

export class Client implements IClient {
  public pgClient: pg.Client;

  public constructor(options: ClientOptions) {
    this.pgClient = new pg.Client();
  }

  public oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return executors.oneFirst(this.pgClient, queryObject, options);
  }

  public one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return executors.one(this.pgClient, queryObject, options);
  }

  public maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return executors.maybeOne(this.pgClient, queryObject, options);
  }

  public all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return executors.all(this.pgClient, queryObject, options);
  }

  public query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return executors.query(this.pgClient, queryObject, options);
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
