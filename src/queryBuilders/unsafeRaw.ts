import { postreSymbol } from './constants';
import { InterpolationValueKind } from './sql';

export type UnsafeRawQueryObject = {
  unsafeString: string;
  kind: InterpolationValueKind.UnsafeRawQuery;
  [postreSymbol]: true;
};

export function unsafeRaw(unsafeString: string): UnsafeRawQueryObject {
  const unsafeRawQuery: UnsafeRawQueryObject = {
    kind: InterpolationValueKind.UnsafeRawQuery,
    unsafeString,
    [postreSymbol]: true,
  };

  return unsafeRawQuery;
}
