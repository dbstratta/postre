import * as pg from 'pg';

import { QueryObject } from '../queryBuilders';

export type Executor<TReturn> = (
  poolOrClient: pg.Pool | pg.Client,
  queryObject: QueryObject,
) => Promise<TReturn>;
