import { postreSymbol, sqlTokens } from './constants';
import { SqlObject, SqlFragment } from './sql';
import { UnsafeRawObject } from './unsafeRaw';
import { AndObject } from './and';
import { OrObject } from './or';
import { ObjectKind, PostreObject } from './types';
import { IdentifierObject } from './identifiers';
import { AssignmentsObject } from './assignments';
import { JoinObject } from './join';

export function isSql(value: any): value is SqlObject {
  return isPostreObject(value) && value.kind === ObjectKind.Sql;
}

export function isOr(value: any): value is OrObject {
  return isPostreObject(value) && value.kind === ObjectKind.And;
}

export function isAnd(value: any): value is AndObject {
  return isPostreObject(value) && value.kind === ObjectKind.Or;
}

export function isIdentifier(value: any): value is IdentifierObject {
  return isPostreObject(value) && value.kind === ObjectKind.Identifier;
}

export function isAssignment(value: any): value is AssignmentsObject {
  return isPostreObject(value) && value.kind === ObjectKind.Assignments;
}

export function isJoin(value: any): value is JoinObject {
  return isPostreObject(value) && value.kind === ObjectKind.Join;
}

export function isUnsafeRaw(value: any): value is UnsafeRawObject {
  return isPostreObject(value) && value.kind === ObjectKind.UnsafeRaw;
}

function isPostreObject(value: any): value is PostreObject {
  return typeof value === 'object' && value && value[postreSymbol];
}

export function replaceLastValue<TValue>(array: TValue[], newLastValue: TValue): TValue[] {
  return array.slice(0, -1).concat(newLastValue);
}

export function stringifyIdentifierObject(identifierObject: IdentifierObject): string {
  return identifierObject.names.map(quoteString).join('.');
}

export function quoteString(value: string): string {
  return `"${value}"`;
}

export function appendStringToLastElementInPlace(
  strings: string[],
  stringToAppend: string,
): string[] {
  // eslint-disable-next-line no-param-reassign
  strings[strings.length - 1] += stringToAppend;

  return strings;
}

export function prependStringToFirstElementInPlace(
  strings: string[],
  stringToPrepend: string,
): string[] {
  // eslint-disable-next-line no-param-reassign
  strings[0] = `${stringToPrepend}${strings[0]}`;

  return strings;
}

export function getLogicalOperatorSqlTokenByLogicObjectKind(
  objectKind: ObjectKind.And | ObjectKind.Or,
): string {
  if (objectKind === ObjectKind.And) {
    return sqlTokens.and;
  }

  return sqlTokens.or;
}

export function getStringToAppendAndStringsToPushForSqlObject(
  sqlFragments: SqlFragment[],
  nextOriginalFragment: SqlFragment,
): [string, string[]] {
  let stringToAppend = sqlFragments[0];
  const stringsToPush = sqlFragments.slice(1);

  if (stringsToPush.length > 0) {
    appendStringToLastElementInPlace(stringsToPush, nextOriginalFragment);
  } else {
    stringToAppend += nextOriginalFragment;
  }

  return [stringToAppend, stringsToPush];
}

export function makeParameterString(parameterNumber: number): string {
  return sqlTokens.parameterPrefix + parameterNumber.toString();
}
