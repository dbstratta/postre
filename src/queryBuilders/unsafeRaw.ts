import { postreSymbol } from './constants';
import { ObjectKind } from './types';

export type UnsafeRawObject = {
  unsafeString: string;
  kind: ObjectKind.UnsafeRaw;
  [postreSymbol]: true;
};

export function unsafeRaw(unsafeString: string): UnsafeRawObject {
  const unsafeRaw: UnsafeRawObject = {
    kind: ObjectKind.UnsafeRaw,
    unsafeString,
    [postreSymbol]: true,
  };

  return unsafeRaw;
}
