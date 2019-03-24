import { Pool, Client, PoolOptions, ClientOptions } from './clients';

export function createPool(options: PoolOptions): Pool {
  return new Pool(options);
}

export function createClient(options: ClientOptions): Client {
  return new Client(options);
}
