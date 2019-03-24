import { TransactionFunction, StartTransactionOptions } from './IClient';
import { Client } from './Client';
import { PoolClient } from './PoolClient';

export async function doInTransaction<TReturn>(
  client: Client | PoolClient,
  transactionFunction: TransactionFunction<TReturn>,
  options?: StartTransactionOptions,
): Promise<TReturn> {
  const transaction = await client.startTransaction(options);

  try {
    const result = await transactionFunction(transaction);

    await transaction.commit();

    return result;
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}
