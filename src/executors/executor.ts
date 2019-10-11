import * as pg from 'pg';

import { SqlObject } from '../queryBuilders';

import { QueryOptions } from './query';

export type Executor<TReturn, TOptions = QueryOptions> = (
  client: pg.Pool | pg.PoolClient | pg.Client,
  sqlObject: SqlObject,
  options?: TOptions,
) => Promise<TReturn>;
