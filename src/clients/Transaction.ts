import * as pg from 'pg';

import { sql } from '../queryBuilders';

import {
  BaseClient,
  StartTransactionOptions,
  TransactionIsolationLevel,
  TransactionFunction,
} from './BaseClient';
import { Client } from './Client';
import { PoolClient } from './PoolClient';

export type TransactionOptions<TClient extends Client | PoolClient> = {
  client: TClient;
} & Partial<TransactionConfig>;

export type TransactionConfig = {
  isolationLevel?: TransactionIsolationLevel;
  releaseWhenFinished: boolean;
};

export class Transaction<
  TClient extends Client | PoolClient
> extends BaseClient {
  public config: TransactionConfig;

  public readonly client: TClient;

  public constructor(options: TransactionOptions<TClient>) {
    super();

    this.config = {
      isolationLevel: options.isolationLevel,
      releaseWhenFinished:
        options.releaseWhenFinished === undefined
          ? true
          : options.releaseWhenFinished,
    };

    this.client = options.client;
  }

  public getPgClient(): pg.Client | pg.PoolClient {
    return this.client.getPgClient();
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
