import { Query } from './types';
import { sqlTokens } from './constants';

export function makeParametizedQueryString(query: Query): string {
  const queryString = query.fragments.reduce(
    (partialQueryString, queryFragment, index) => {
      if (index === 0) {
        return partialQueryString + queryFragment;
      }

      return (
        partialQueryString + sqlTokens.parameterPrefix + index + queryFragment
      );
    },
    '',
  );

  return queryString;
}

export function makeUnsafeRawQueryString(query: Query): string {
  const queryString = query.fragments.reduce(
    (partialQueryString, queryFragment, index) => {
      if (index === 0) {
        return partialQueryString + queryFragment;
      }

      const unsafeSerializedValue = unsafeSerializeValue(
        query.values[index - 1],
      );

      return partialQueryString + unsafeSerializedValue + queryFragment;
    },
    '',
  );

  return queryString;
}

function unsafeSerializeValue(value: string | number | boolean | null): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    if (value) {
      return sqlTokens.true;
    }

    return sqlTokens.false;
  }

  return sqlTokens.null;
}
