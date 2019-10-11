import { postreSymbol } from './constants';
import { unsafeRaw, UnsafeRawObject } from './unsafeRaw';
import { AndObject, and } from './and';
import { OrObject, or } from './or';
import { ObjectKind, PostreObject, PrimitiveType } from './types';
import { IdentifierObject, identifier } from './identifiers';
import { AssignmentObject, assignment } from './assignment';

export type SqlObject = PostreObject & {
  kind: ObjectKind.Sql;
  fragments: readonly SqlFragment[];
  values: SqlValue[];
};

export type SqlFragment = string;

export type SqlValue =
  | SqlObject
  | UnsafeRawObject
  | AndObject
  | OrObject
  | IdentifierObject
  | AssignmentObject
  | PrimitiveType;

export function sql(
  sqlFragments: readonly SqlFragment[],
  ...interpolationValues: SqlValue[]
): SqlObject {
  const sqlObject: SqlObject = {
    kind: ObjectKind.Sql,
    fragments: sqlFragments,
    values: interpolationValues,
    [postreSymbol]: true,
  };

  return sqlObject;
}

sql.unsafeRaw = unsafeRaw;
sql.and = and;
sql.or = or;
sql.identifier = identifier;
sql.assignment = assignment;
