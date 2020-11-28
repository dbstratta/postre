import { PostreObject } from './types';
import { sqlTokens } from './constants';
import { sql } from './sql';

export type IdentifiersAndVauesForInsert = {
  identifiers: PostreObject;
  values: PostreObject;
};

export function getIdentifiersAndValuesForInsert(
  recordOrRecords: Record<string, any> | Record<string, any>[],
): IdentifiersAndVauesForInsert {
  if (Array.isArray(recordOrRecords)) {
    return getIdentifiersAndValuesForInserts(recordOrRecords);
  }

  return doGetIdentifiersAndValuesForInsert(recordOrRecords);
}

function doGetIdentifiersAndValuesForInsert(
  record: Record<string, any>,
): IdentifiersAndVauesForInsert {
  const entries = Object.entries(record).filter(
    ([, value]) => value !== undefined,
  );

  const keys = entries.map((entry) => entry[0]);
  const valueList = entries.map((entry) => entry[1]);

  const identifiers = makeInsertIdentifiers(keys);
  const values = makeInsertValues(valueList);

  return { identifiers, values };
}

function getIdentifiersAndValuesForInserts(
  records: Record<string, any>[],
): { identifiers: PostreObject; values: PostreObject } {
  const keys = getKeysForInserts(records);

  const valuesList = getValuesListForInserts(keys, records);

  const identifiers = makeInsertIdentifiers(keys);

  const valuesSqlObjects = valuesList.map((values) => makeInsertValues(values));

  const valuesSql = sql.join(valuesSqlObjects, sql`, `);

  return { identifiers, values: valuesSql };
}

function getKeysForInserts(records: Record<string, any>[]): string[] {
  const keySet = records.reduce<Set<string>>((partialKeySet, record) => {
    Object.keys(record).forEach((key) => {
      partialKeySet.add(key);
    });

    return partialKeySet;
  }, new Set());

  const keys = [...keySet.values()];

  return keys;
}

function getValuesListForInserts(
  keys: string[],
  records: Record<string, any>[],
): any[][] {
  const valuesList = records.map((record) => {
    const values = keys.map((key) => {
      if (record[key] === undefined) {
        return sql.unsafeRaw(sqlTokens.default);
      }

      return record[key];
    });

    return values;
  });

  return valuesList;
}

function makeInsertIdentifiers(keys: string[]): PostreObject {
  const identifiers = sql`(${sql.join(
    keys.map((key) => sql.identifier(key)),
    sql`, `,
  )})`;

  return identifiers;
}

function makeInsertValues(values: any[]): PostreObject {
  const valuesSql = sql`(${sql.join(values, sql`, `)})`;

  return valuesSql;
}
