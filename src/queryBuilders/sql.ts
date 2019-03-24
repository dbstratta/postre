import { postreSymbol } from './constants';
import { isQuery, isUnsafeRawQuery, replaceLastValue } from './helpers';
import { unsafeRaw, UnsafeRawQueryObject } from './unsafeRaw';

export type InterpolationValue =
  | QueryValue
  | QueryObject
  | UnsafeRawQueryObject;

export type QueryObject = {
  kind: InterpolationValueKind.Query;
  fragments: QueryFragment[];
  values: QueryValue[];
  [postreSymbol]: true;
};

export enum InterpolationValueKind {
  Query = 'query',
  UnsafeRawQuery = 'unsafeRawQuery',
}

export type QueryFragment = string;

export type QueryValue = number | string | boolean | object | null;

export function sql(
  queryFragments: ReadonlyArray<QueryFragment>,
  ...interpolationValues: InterpolationValue[]
): QueryObject {
  const fragments = flattenQueryFragments(queryFragments, interpolationValues);
  const values = flattenInterpolationValues(interpolationValues);

  const queryObject: QueryObject = {
    kind: InterpolationValueKind.Query,
    fragments,
    values,
    [postreSymbol]: true,
  };

  return queryObject;
}

sql.unsafeRaw = unsafeRaw;

function flattenQueryFragments(
  queryFragments: ReadonlyArray<QueryFragment>,
  interpolationValues: InterpolationValue[],
): QueryFragment[] {
  const firstQueryFragment = queryFragments[0];

  const flattenedQueryFragments = interpolationValues.reduce(
    (
      partialQueryFragments: QueryFragment[],
      interpolationValue,
      interpolationValueIndex,
    ) => {
      const currentOriginalFragment = queryFragments[interpolationValueIndex];
      const nextOriginalFragment = queryFragments[interpolationValueIndex + 1];

      if (isQuery(interpolationValue)) {
        const subquery = interpolationValue;

        const modifiedPartialQueryFragments = replaceLastValue(
          partialQueryFragments,
          currentOriginalFragment + subquery.fragments[0],
        ).concat(subquery.fragments.slice(1));

        return replaceLastValue(
          modifiedPartialQueryFragments,
          modifiedPartialQueryFragments[
            modifiedPartialQueryFragments.length - 1
          ] + nextOriginalFragment,
        );
      }

      if (isUnsafeRawQuery(interpolationValue)) {
        const unsafeString = interpolationValue.unsafeString;

        return replaceLastValue(
          partialQueryFragments,
          currentOriginalFragment + unsafeString + nextOriginalFragment,
        );
      }

      return partialQueryFragments.concat(nextOriginalFragment);
    },
    [firstQueryFragment],
  );

  return flattenedQueryFragments;
}

function flattenInterpolationValues(
  interpolationValues: InterpolationValue[],
): QueryValue[] {
  const flattenedQueryValues: QueryValue[] = interpolationValues.flatMap(
    interpolationValue => {
      if (isQuery(interpolationValue)) {
        const subquery = interpolationValue;

        return subquery.values;
      }

      if (isUnsafeRawQuery(interpolationValue)) {
        return [];
      }

      return interpolationValue;
    },
  );

  return flattenedQueryValues;
}
