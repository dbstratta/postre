import { postreSymbol } from './constants';
import { ObjectKind, PostreObject, PrimitiveType } from './types';
import { SqlObject } from './sql';
import { IdentifierObject } from './identifiers';

export type JoinValue = SqlObject | IdentifierObject | PrimitiveType;

export type JoinSeparator = SqlObject;

export type JoinObject = PostreObject & {
  kind: ObjectKind.Join;
  values: JoinValue[];
  separator: JoinSeparator;
};

export function join(values: JoinValue[], separator: JoinSeparator): JoinObject {
  return {
    kind: ObjectKind.Join,
    values,
    separator,
    [postreSymbol]: true,
  };
}
