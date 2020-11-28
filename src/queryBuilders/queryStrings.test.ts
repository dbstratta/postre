import { makeParameterizedQuery } from './queryStrings';
import { sql } from './sql';

describe('makeParameterizedQuery', () => {
  test('makes correct query when there are no interpolations', () => {
    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT 1
    `);

    expect(queryString.trim()).toBe('SELECT 1');

    expect(queryValues).toHaveLength(0);
  });

  test('makes correct query when there are only primitive interpolations', () => {
    const number = 123;
    const string = 'string';
    const boolean = true;
    const object = {};
    const nullValue = null;

    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT ${number}, ${string}, ${boolean}, ${object}, ${nullValue}
      FROM test
    `);

    expect(queryString).toBe(`
      SELECT $1, $2, $3, $4, $5
      FROM test
    `);

    expect(queryValues).toHaveLength(5);
    expect(queryValues[0]).toBe(number);
    expect(queryValues[1]).toBe(string);
    expect(queryValues[2]).toBe(boolean);
    expect(queryValues[3]).toBe(object);
    expect(queryValues[4]).toBe(nullValue);
  });

  test('makes correct query when there are nested sql objects', () => {
    const value1 = 123;
    const value2 = 222;
    const value3 = 543;

    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT ${sql`${value1}, TRUE`}
      FROM test
      WHERE
        ${sql`column > ${sql`${value2} + 3`}
        AND column2 = ${value3}`};
    `);

    expect(queryString).toBe(`
      SELECT $1, TRUE
      FROM test
      WHERE
        column > $2 + 3
        AND column2 = $3;
    `);

    expect(queryValues).toHaveLength(3);
    expect(queryValues[0]).toBe(value1);
    expect(queryValues[1]).toBe(value2);
    expect(queryValues[2]).toBe(value3);
  });

  test('makes correct query when there are aggresively nested sql objects', () => {
    const value = 123;

    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT ${sql`${sql`${sql`${sql`${sql`${sql`${sql`${sql`${value}`}`}`}`}`}`}`}`}
      FROM test
    `);

    expect(queryString).toBe(`
      SELECT $1
      FROM test
    `);

    expect(queryValues).toHaveLength(1);
    expect(queryValues[0]).toBe(value);
  });

  test('makes correct query when there are identifier objects', () => {
    const identifier1 = 'table1';
    const identifier2 = ['schema1', 'table2'];

    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT 1 FROM ${sql.identifier(identifier1)} AS t1
      JOIN ${sql.identifier(identifier2 as any)} AS t2 ON t2.id = t1.id
    `);

    expect(queryString).toBe(`
      SELECT 1 FROM "table1" AS t1
      JOIN "schema1"."table2" AS t2 ON t2.id = t1.id
    `);

    expect(queryValues).toHaveLength(0);
  });
});
