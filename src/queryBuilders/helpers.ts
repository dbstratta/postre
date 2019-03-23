import { postreSymbol } from './constants';
import { QueryObject, InterpolationValueKind } from './sql';

export function isQuery(value: any): value is QueryObject {
  return (
    typeof value === 'object' &&
    value &&
    value[postreSymbol] &&
    value.kind === InterpolationValueKind.Query
  );
}

export function replaceLastValue<TValue>(
  array: TValue[],
  newLastValue: TValue,
): TValue[] {
  return array.slice(0, -1).concat(newLastValue);
}
