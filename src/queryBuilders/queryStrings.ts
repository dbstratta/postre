import { sqlTokens } from './constants';
import { QueryObject, QueryValue } from './sql';

export function makeParametizedQueryString(query: QueryObject): string {
  const queryString = query.fragments.reduce(
    (partialQueryString, queryFragment, index) => {
      if (index === 0) {
        return partialQueryString + queryFragment;
      }

      return (
        partialQueryString +
        sqlTokens.parameterPrefix +
        index.toString() +
        queryFragment
      );
    },
    '',
  );

  return queryString;
}

export function makeUnsafeRawQueryString(query: QueryObject): string {
  const queryString = query.fragments.reduce(
    (partialQueryString, queryFragment, index) => {
      if (index === 0) {
        return partialQueryString + queryFragment;
      }

      const unsafeSerializedQueryValue = unsafeSerializeQueryValue(
        query.values[index - 1],
      );

      return partialQueryString + unsafeSerializedQueryValue + queryFragment;
    },
    '',
  );

  return queryString;
}

function unsafeSerializeQueryValue(queryValue: QueryValue): string {
  if (typeof queryValue === 'string') {
    return `'${queryValue}'`;
  }

  if (typeof queryValue === 'number') {
    return queryValue.toString();
  }

  if (typeof queryValue === 'boolean') {
    if (queryValue) {
      return sqlTokens.true;
    }

    return sqlTokens.false;
  }

  if (typeof queryValue === 'object' && queryValue !== null) {
    return `'${JSON.stringify(queryValue)}'`;
  }

  return sqlTokens.null;
}
