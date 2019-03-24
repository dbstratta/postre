import { QueryObject, sql } from '../queryBuilders';
import * as executors from '../executors';

import {
  IClient,
  StartTransactionOptions,
  TransactionIsolationLevel,
  TransactionFunction,
} from './IClient';
import { Client } from './Client';
import { PoolClient } from './PoolClient';

export type TransactionOptions<TClient extends Client | PoolClient> = {
  client: TClient;
} & Partial<TransactionConfig>;

export type TransactionConfig = {
  isolationLevel?: TransactionIsolationLevel;
  releaseWhenFinished: boolean;
};

export class Transaction<TClient extends Client | PoolClient>
  implements IClient {
  public config: TransactionConfig;

  public readonly client: TClient;

  public constructor(options: TransactionOptions<TClient>) {
    this.config = {
      isolationLevel: options.isolationLevel,
      releaseWhenFinished:
        options.releaseWhenFinished === undefined
          ? true
          : options.releaseWhenFinished,
    };

    this.client = options.client;
  }

  public oneFirst(
    queryObject: QueryObject,
    options?: executors.OneFirstQueryOptions,
  ): ReturnType<typeof executors.oneFirst> {
    return this.client.oneFirst(queryObject, options);
  }

  public one(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.one> {
    return this.client.one(queryObject, options);
  }

  public maybeOne(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.maybeOne> {
    return this.client.maybeOne(queryObject, options);
  }

  public all(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.all> {
    return this.client.all(queryObject, options);
  }

  public query(
    queryObject: QueryObject,
    options?: executors.QueryOptions,
  ): ReturnType<typeof executors.query> {
    return this.client.query(queryObject, options);
  }

  public async startTransaction(
    options: StartTransactionOptions = {},
  ): Promise<Transaction<TClient>> {
    return this;
  }

  /**
   * Starts the actual database transaction.
   *
   * See https://www.postgresql.org/docs/current/sql-start-transaction.html
   * for more information.
   */
  public async start(): Promise<void> {
    const isolationLevel = this.config.isolationLevel || '';

    await this.query(sql`START TRANSACTION ${sql.unsafeRaw(isolationLevel)}`);
  }

  /**
   * Commits the transaction.
   *
   * See https://www.postgresql.org/docs/current/sql-commit.html
   * for more information.
   */
  public async commit(): Promise<void> {
    await this.query(sql`COMMIT TRANSACTION`);
  }

  /**
   * Rollbacks the transaction.
   *
   * See https://www.postgresql.org/docs/current/sql-rollback.html
   * for more information.
   */
  public async rollback(): Promise<void> {
    await this.query(sql`ROLLBACK TRANSACTION`);
  }

  /**
   * Establishes a new savepoint within the current transaction.
   *
   * See https://www.postgresql.org/docs/current/sql-savepoint.html
   * for more information.
   */
  public async savepoint(savepointName: string): Promise<void> {
    await this.query(sql`SAVEPOINT ${sql.unsafeRaw(savepointName)}`);
  }

  /**
   * Rolls back all commands that were executed after the savepoint
   * was established.
   *
   * See https://www.postgresql.org/docs/current/sql-rollback-to.html
   * for more information.
   */
  public async rollbackToSavepoint(savepointName: string): Promise<void> {
    await this.query(
      sql`ROLLBACK TO SAVEPOINT ${sql.unsafeRaw(savepointName)}`,
    );
  }

  /**
   * Releases (destroys) a previously defined savepoint.
   *
   * See https://www.postgresql.org/docs/current/sql-release-savepoint.html
   * for more information.
   */
  public async releaseSavepoint(savepointName: string): Promise<void> {
    await this.query(sql`RELEASE SAVEPOINT ${sql.unsafeRaw(savepointName)}`);
  }

  public doInTransaction<TReturn>(
    transactionFunction: TransactionFunction<TReturn>,
    options?: StartTransactionOptions,
  ): Promise<TReturn> {
    return transactionFunction(this);
  }
}
