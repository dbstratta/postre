import { sql } from './sql';

describe('sql', () => {
  test('builds correct query object when there are no interpolations', () => {
    const queryObject = sql`
      SELECT 1
    `;

    expect(queryObject.fragments).toHaveLength(1);
    expect(queryObject.fragments[0].trim()).toBe('SELECT 1');

    expect(queryObject.values).toHaveLength(0);
  });
});
