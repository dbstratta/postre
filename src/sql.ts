import {
  QueryFragments,
  Query,
  QueryValues,
  InterpolationValue,
  InterpolationValueKind,
  InterpolationValues,
} from './types';
import { isQuery, replaceLastValue } from './helpers';

export function sql(
  queryFragments: QueryFragments,
  ...interpolationValues: InterpolationValue[]
): Query {
  const fragments: QueryFragments = flattenQueryFragments(
    queryFragments,
    interpolationValues,
  );
  const values: QueryValues = flattenInterpolationValues(interpolationValues);

  const query: Query = {
    kind: InterpolationValueKind.Query,
    fragments,
    values,
  };

  return query;
}

function flattenQueryFragments(
  queryFragments: QueryFragments,
  interpolationValues: InterpolationValues,
): QueryFragments {
  const firstQueryFragment = queryFragments[0];

  const flattenedQueryFragments: QueryFragments = interpolationValues.reduce(
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
  interpolationValues: ReadonlyArray<InterpolationValue>,
): QueryValues {
  const flattenedQueryValues: QueryValues = interpolationValues.flatMap(
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
