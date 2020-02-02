import { postreSymbol } from './constants';
import { AndObject } from './and';
import { OrObject } from './or';
import { SqlObject } from './sql';

export enum ObjectKind {
  Sql = 'sql',
  UnsafeRaw = 'unsafeRaw',
  And = 'and',
  Or = 'or',
  Identifier = 'identifier',
  InfixOperation = 'infixOperation',
  Assignments = 'assignments',
  Join = 'join',
}

export type PostreObject = {
  kind: ObjectKind;
  [postreSymbol]: true;
};

export type PrimitiveType = object | string | number | boolean | null;

export type LogicCondition = AndObject | OrObject | SqlObject | boolean | null;
