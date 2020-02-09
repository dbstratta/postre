import { TransactionFunction, StartTransactionOptions, ClientOverrideOptions } from './BaseClient';
import { Client } from './Client';
import { PoolClient } from './PoolClient';
import { Transaction } from './Transaction';

export async function doInTransaction<TReturn>(
  client: Client | PoolClient,
  transactionFunction: TransactionFunction<TReturn>,
  options?: StartTransactionOptions,
): Promise<TReturn> {
  const transaction = await client.startTransaction(options);

  try {
    const optionsWithTransaction: ClientOverrideOptions = {
      ...options,
      client: transaction,
    };

    const result = await transactionFunction(transaction, optionsWithTransaction);

    await transaction.commit();

    return result;
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}

export async function doStartTransaction<TClient extends PoolClient | Client>(
  client: TClient,
  options: StartTransactionOptions = {},
): Promise<Transaction<TClient>> {
  const transaction = new Transaction({
    client,
    isolationLevel: options.isolationLevel,
  });

  await transaction.start();

  return transaction;
}
