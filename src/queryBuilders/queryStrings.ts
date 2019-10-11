import { sqlTokens } from './constants';
import { SqlObject, SqlFragment, SqlValue } from './sql';
import {
  isSql,
  isAnd,
  isOr,
  isUnsafeRaw,
  isIdentifier,
  quoteString,
  appendStringToLastElementInPlace,
  getLogicalOperatorSqlTokenByLogicObjectKind,
  prependStringToFirstElementInPlace,
  isAssignment,
} from './helpers';
import { AndObject } from './and';
import { OrObject } from './or';
import { AssignmentObject } from './assignment';

export type QueryString = string;

export type QueryValue = object | string | number | boolean | null;

export function makeParameterizedQuery(sqlObject: SqlObject): [QueryString, QueryValue[]] {
  const flattenedSqlFragments = flattenSqlFragments(sqlObject);

  const queryString = makeParameterizedQueryString(flattenedSqlFragments);
  const queryValues = getQueryValuesFromSqlValues(sqlObject.values);

  return [queryString, queryValues];
}

function flattenSqlFragments(sqlObject: SqlObject): SqlFragment[] {
  const firstSqlFragment = sqlObject.fragments[0];

  const flattenedSqlFragments = sqlObject.values.reduce(
    (partialSqlFragments: SqlFragment[], sqlValue, sqlValueIndex) => {
      const nextOriginalFragment = sqlObject.fragments[sqlValueIndex + 1];

      let stringToAppend: string;
      let stringsToPush: string[];

      if (isSql(sqlValue)) {
        const flattenedSubFragments = flattenSqlFragments(sqlValue);

        stringToAppend = flattenedSubFragments[0];
        stringsToPush = appendStringToLastElementInPlace(
          flattenedSubFragments.slice(1),
          nextOriginalFragment,
        );
      } else if (isAnd(sqlValue) || isOr(sqlValue)) {
        const flattenedSubFragments = getSqlFragmentsFromLogicObject(sqlValue);

        stringToAppend = flattenedSubFragments[0];
        stringsToPush = appendStringToLastElementInPlace(
          flattenedSubFragments.slice(1),
          nextOriginalFragment,
        );
      } else if (isAssignment(sqlValue)) {
        const flattenedSubFragments = getSqlFragmentsFromAssignmentObject(sqlValue);

        stringToAppend = flattenedSubFragments[0];
        stringsToPush = appendStringToLastElementInPlace(
          flattenedSubFragments.slice(1),
          nextOriginalFragment,
        );
      } else if (isUnsafeRaw(sqlValue)) {
        stringToAppend = sqlValue.unsafeString + nextOriginalFragment;
        stringsToPush = [];
      } else if (isIdentifier(sqlValue)) {
        stringToAppend = sqlValue.names.map(quoteString).join('.') + nextOriginalFragment;
        stringsToPush = [];
      } else {
        stringToAppend = '';
        stringsToPush = [nextOriginalFragment];
      }

      appendStringToLastElementInPlace(partialSqlFragments, stringToAppend).push(...stringsToPush);

      return partialSqlFragments;
    },
    [firstSqlFragment],
  );

  return flattenedSqlFragments;
}

function getSqlFragmentsFromLogicObject(logicObject: AndObject | OrObject): SqlFragment[] {
  const sqlFragments = logicObject.conditions.reduce(
    (partialSqlFragments: SqlFragment[], condition, conditionIndex) => {
      let stringToAppend: string;
      let stringsToPush: string[];

      const logicalOperatorSqlToken = getLogicalOperatorSqlTokenByLogicObjectKind(logicObject.kind);

      if (isSql(condition)) {
        const subFragments = flattenSqlFragments(condition);

        if (conditionIndex === 0) {
          stringToAppend = subFragments[0];
        } else {
          stringToAppend = ` ${logicalOperatorSqlToken} ${subFragments[0]}`;
        }

        stringsToPush = subFragments.slice(1);
      } else if (isAnd(condition) || isOr(condition)) {
        const subFragments = getSqlFragmentsFromLogicObject(condition);

        if (conditionIndex === 0) {
          stringToAppend = subFragments[0];
        } else {
          stringToAppend = ` ${logicalOperatorSqlToken} ${subFragments[0]}`;
        }

        stringsToPush = subFragments.slice(1);
      } else {
        if (conditionIndex === 0) {
          stringToAppend = '';
        } else {
          stringToAppend = ` ${logicalOperatorSqlToken} `;
        }

        stringsToPush = [''];
      }

      appendStringToLastElementInPlace(partialSqlFragments, stringToAppend).push(...stringsToPush);

      return partialSqlFragments;
    },
    [''],
  );

  if (logicObject.conditions.length >= 2) {
    prependStringToFirstElementInPlace(sqlFragments, '(');
    appendStringToLastElementInPlace(sqlFragments, ')');
  }

  return sqlFragments;
}

function getSqlFragmentsFromAssignmentObject(assignmentObject: AssignmentObject): SqlFragment[] {
  const sqlFragments = Object.entries(assignmentObject.assignments).reduce(
    (partialSqlFragments: SqlFragment[], [key, value], assignmentIndex) => {
      if (assignmentIndex !== 0) {
        appendStringToLastElementInPlace(partialSqlFragments, ', ');
      }

      appendStringToLastElementInPlace(
        partialSqlFragments,
        `${key} ${sqlTokens.assignmentOperator} `,
      );

      let stringToAppend: string;
      let stringsToPush: string[];

      if (isSql(value)) {
        const subFragments = flattenSqlFragments(value);

        stringToAppend = subFragments[0];
        stringsToPush = subFragments.slice(1);
      } else {
        stringToAppend = '';
        stringsToPush = [''];
      }

      appendStringToLastElementInPlace(partialSqlFragments, stringToAppend).push(...stringsToPush);

      return partialSqlFragments;
    },
    [''],
  );

  return sqlFragments;
}

function getQueryValuesFromSqlValues(sqlValues: SqlValue[]): QueryValue[] {
  const queryValues = sqlValues.flatMap(getQueryValuesFromSqlValue);

  return queryValues;
}

function getQueryValuesFromSqlValue(sqlValue: SqlValue): QueryValue[] {
  if (isSql(sqlValue)) {
    return sqlValue.values.flatMap(getQueryValuesFromSqlValue);
  }

  if (isAnd(sqlValue) || isOr(sqlValue)) {
    return sqlValue.conditions.flatMap(getQueryValuesFromSqlValue);
  }

  if (isAssignment(sqlValue)) {
    return Object.values(sqlValue.assignments).flatMap(getQueryValuesFromSqlValue);
  }

  if (isIdentifier(sqlValue) || isUnsafeRaw(sqlValue)) {
    return [];
  }

  return [sqlValue];
}

function makeParameterizedQueryString(sqlFragments: SqlFragment[]): QueryString {
  const queryString = sqlFragments.reduce((partialQueryString, queryFragment, index) => {
    if (index === 0) {
      return partialQueryString + queryFragment;
    }

    return partialQueryString + sqlTokens.parameterPrefix + index.toString() + queryFragment;
  }, '');

  return queryString;
}
