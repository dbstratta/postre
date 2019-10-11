import { ObjectKind, PostreObject } from './types';
import { postreSymbol } from './constants';

export type IdentifierObject = PostreObject & {
  kind: ObjectKind.Identifier;
  names: [string] | [string, string];
};

export function identifier(nameOrNames: string | [string, string]): IdentifierObject {
  const names = Array.isArray(nameOrNames) ? nameOrNames : ([nameOrNames] as [string]);

  const identifierObject: IdentifierObject = {
    kind: ObjectKind.Identifier,
    names,
    [postreSymbol]: true,
  };

  return identifierObject;
}
