import { Query, InterpolationValueKind } from './types';

export function isQuery(value: any): value is Query {
  return (
    typeof value === 'object' &&
    value &&
    value.kind === InterpolationValueKind.Query
  );
}

export function replaceLastValue<TValue>(
  array: TValue[],
  newLastValue: TValue,
): TValue[] {
  return array.slice(0, -1).concat(newLastValue);
}
