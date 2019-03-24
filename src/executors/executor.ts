import * as pg from 'pg';

import { QueryObject } from '../queryBuilders';

import { QueryOptions } from './query';

export type Executor<TReturn, TOptions = QueryOptions> = (
  client: pg.Pool | pg.PoolClient | pg.Client,
  queryObject: QueryObject,
  options?: TOptions,
) => Promise<TReturn>;
