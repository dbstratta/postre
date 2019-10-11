import { sql } from './sql';

describe('sql', () => {
  test('builds correct sql object when there are no interpolations', () => {
    const sqlObject = sql`
      SELECT 1
    `;

    expect(sqlObject.fragments).toHaveLength(1);
    expect(sqlObject.fragments[0].trim()).toBe('SELECT 1');

    expect(sqlObject.values).toHaveLength(0);
  });

  test('builds correct sql object when there are only primitive interpolations', () => {
    const number = 300;
    const string = 'string';
    const boolean = true;

    const sqlObject = sql`
      SELECT ${number}, ${string}, ${boolean}
    `;

    expect(sqlObject.fragments).toHaveLength(4);
    expect(sqlObject.fragments[0].trim()).toBe('SELECT');
    expect(sqlObject.fragments[1].trim()).toBe(',');
    expect(sqlObject.fragments[2].trim()).toBe(',');
    expect(sqlObject.fragments[3].trim()).toBe('');

    expect(sqlObject.values).toHaveLength(3);
    expect(sqlObject.values[0]).toBe(number);
    expect(sqlObject.values[1]).toBe(string);
    expect(sqlObject.values[2]).toBe(boolean);
  });
});
