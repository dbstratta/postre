import { makeParameterizedQuery } from './queryStrings';
import { sql } from './sql';

describe(makeParameterizedQuery.name, () => {
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
    `);

    expect(queryString).toBe(`
      SELECT $1, $2, $3, $4, $5
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

    const [queryString, queryValues] = makeParameterizedQuery(sql`
      SELECT ${sql`${value1}`}
      FROM test
      WHERE ${sql`column > ${sql`${value2}`}`}
    `);

    expect(queryString).toBe(`
      SELECT $1
      FROM test
      WHERE column > $2
    `);

    expect(queryValues).toHaveLength(2);
    expect(queryValues[0]).toBe(value1);
    expect(queryValues[1]).toBe(value2);
  });
});
