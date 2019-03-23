import { postreSymbol } from './constants';
import { isQuery, replaceLastValue } from './helpers';

export type InterpolationValue = QueryValue | QueryObject;

export type QueryObject = {
  kind: InterpolationValueKind.Query;
  fragments: QueryFragment[];
  values: QueryValue[];
  [postreSymbol]: true;
};

export enum InterpolationValueKind {
  Query = 'query',
}

export type QueryFragment = string;

export type QueryValue = number | string | boolean | null;

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

function flattenQueryFragments(
  queryFragments: ReadonlyArray<QueryFragment>,
  interpolationValues: InterpolationValue[],
): QueryFragment[] {
  const firstQueryFragment = queryFragments[0];

  const flattenedQueryFragments: QueryFragment[] = interpolationValues.reduce(
    (partialQueryFragments, interpolationValue, interpolationValueIndex) => {
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

      return interpolationValue;
    },
  );

  return flattenedQueryValues;
}
