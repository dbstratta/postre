import { sqlTokens } from './constants';
import { SqlObject, SqlFragment, SqlValue } from './sql';
import {
  isSql,
  isAnd,
  isOr,
  isUnsafeRaw,
  isIdentifier,
  appendStringToLastElementInPlace,
  getLogicalOperatorSqlTokenByLogicObjectKind,
  prependStringToFirstElementInPlace,
  isAssignment,
  isJoin,
  stringifyIdentifierObject,
  getStringToAppendAndStringsToPushForSqlObject,
  quoteString,
  makeParameterString,
} from './helpers';
import { AndObject } from './and';
import { OrObject } from './or';
import { AssignmentsObject } from './assignments';
import { JoinObject } from './join';

export type QueryString = string;

export type QueryValue =
  | QueryValue[]
  | { [key: string]: QueryValue }
  | string
  | number
  | boolean
  | null;

export function makeParameterizedQuery(
  sqlObject: SqlObject,
): [QueryString, QueryValue[]] {
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

        [
          stringToAppend,
          stringsToPush,
        ] = getStringToAppendAndStringsToPushForSqlObject(
          flattenedSubFragments,
          nextOriginalFragment,
        );
      } else if (isAnd(sqlValue) || isOr(sqlValue)) {
        const flattenedSubFragments = getSqlFragmentsFromLogicObject(sqlValue);

        [
          stringToAppend,
          stringsToPush,
        ] = getStringToAppendAndStringsToPushForSqlObject(
          flattenedSubFragments,
          nextOriginalFragment,
        );
      } else if (isAssignment(sqlValue)) {
        const flattenedSubFragments = getSqlFragmentsFromAssignmentObject(
          sqlValue,
        );

        [
          stringToAppend,
          stringsToPush,
        ] = getStringToAppendAndStringsToPushForSqlObject(
          flattenedSubFragments,
          nextOriginalFragment,
        );
      } else if (isJoin(sqlValue)) {
        const flattenedSubFragments = getSqlFragmentsFromJoinObject(sqlValue);

        [
          stringToAppend,
          stringsToPush,
        ] = getStringToAppendAndStringsToPushForSqlObject(
          flattenedSubFragments,
          nextOriginalFragment,
        );
      } else if (isIdentifier(sqlValue)) {
        stringToAppend =
          stringifyIdentifierObject(sqlValue) + nextOriginalFragment;
        stringsToPush = [];
      } else if (isUnsafeRaw(sqlValue)) {
        stringToAppend = sqlValue.unsafeString + nextOriginalFragment;
        stringsToPush = [];
      } else {
        stringToAppend = '';
        stringsToPush = [nextOriginalFragment];
      }

      appendStringToLastElementInPlace(
        partialSqlFragments,
        stringToAppend,
      ).push(...stringsToPush);

      return partialSqlFragments;
    },
    [firstSqlFragment],
  );

  return flattenedSqlFragments;
}

function getSqlFragmentsFromLogicObject(
  logicObject: AndObject | OrObject,
): SqlFragment[] {
  const sqlFragments = logicObject.conditions.reduce(
    (partialSqlFragments: SqlFragment[], condition, conditionIndex) => {
      let stringToAppend: string;
      let stringsToPush: string[];

      const logicalOperatorSqlToken = getLogicalOperatorSqlTokenByLogicObjectKind(
        logicObject.kind,
      );

      if (isSql(condition)) {
        const subFragments = flattenSqlFragments(condition);

        stringToAppend =
          conditionIndex === 0
            ? subFragments[0]
            : ` ${logicalOperatorSqlToken} ${subFragments[0]}`;

        stringsToPush = subFragments.slice(1);
      } else if (isAnd(condition) || isOr(condition)) {
        const subFragments = getSqlFragmentsFromLogicObject(condition);

        stringToAppend =
          conditionIndex === 0
            ? subFragments[0]
            : ` ${logicalOperatorSqlToken} ${subFragments[0]}`;

        stringsToPush = subFragments.slice(1);
      } else {
        stringToAppend =
          conditionIndex === 0 ? '' : ` ${logicalOperatorSqlToken} `;

        stringsToPush = [''];
      }

      appendStringToLastElementInPlace(
        partialSqlFragments,
        stringToAppend,
      ).push(...stringsToPush);

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

function getSqlFragmentsFromAssignmentObject(
  assignmentObject: AssignmentsObject,
): SqlFragment[] {
  const sqlFragments = Object.entries(assignmentObject.assignments).reduce(
    (partialSqlFragments: SqlFragment[], [key, value], assignmentIndex) => {
      if (assignmentIndex !== 0) {
        appendStringToLastElementInPlace(partialSqlFragments, ', ');
      }

      appendStringToLastElementInPlace(
        partialSqlFragments,
        `${quoteString(key)} ${sqlTokens.assignmentOperator} `,
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

      appendStringToLastElementInPlace(
        partialSqlFragments,
        stringToAppend,
      ).push(...stringsToPush);

      return partialSqlFragments;
    },
    [''],
  );

  return sqlFragments;
}

function getSqlFragmentsFromJoinObject(joinObject: JoinObject): SqlFragment[] {
  const separatorSqlFragments = flattenSqlFragments(joinObject.separator);

  const sqlFragments = joinObject.values.reduce(
    (partialSqlFragments: SqlFragment[], value, valueIndex) => {
      let stringToAppend: string;
      let stringsToPush: string[];

      if (isSql(value)) {
        const subFragments = flattenSqlFragments(value);

        stringToAppend = subFragments[0];
        stringsToPush = subFragments.slice(1);
      } else if (isIdentifier(value)) {
        stringToAppend = stringifyIdentifierObject(value);
        stringsToPush = [];
      } else if (isJoin(value)) {
        const subFragments = getSqlFragmentsFromJoinObject(value);

        stringToAppend = subFragments[0];
        stringsToPush = subFragments.slice(1);
      } else {
        stringToAppend = '';
        stringsToPush = [''];
      }

      appendStringToLastElementInPlace(
        partialSqlFragments,
        stringToAppend,
      ).push(...stringsToPush);

      if (valueIndex !== joinObject.values.length - 1) {
        appendStringToLastElementInPlace(
          partialSqlFragments,
          separatorSqlFragments[0],
        ).push(...separatorSqlFragments.slice(1));
      }

      return partialSqlFragments;
    },
    [''],
  );

  return sqlFragments;
}

function getQueryValuesFromSqlValues(sqlValues: SqlValue[]): QueryValue[] {
  const queryValues = sqlValues.flatMap((value) =>
    getQueryValuesFromSqlValue(value),
  );

  return queryValues;
}

function getQueryValuesFromSqlValue(sqlValue: SqlValue): QueryValue[] {
  if (isSql(sqlValue)) {
    return sqlValue.values.flatMap((value) =>
      getQueryValuesFromSqlValue(value),
    );
  }

  if (isAnd(sqlValue) || isOr(sqlValue)) {
    return sqlValue.conditions.flatMap((condition) =>
      getQueryValuesFromSqlValue(condition),
    );
  }

  if (isAssignment(sqlValue)) {
    return Object.values(sqlValue.assignments).flatMap((value) =>
      getQueryValuesFromSqlValue(value),
    );
  }

  if (isJoin(sqlValue)) {
    return getQueryValuesFromJoinObject(sqlValue);
  }

  if (isIdentifier(sqlValue) || isUnsafeRaw(sqlValue)) {
    return [];
  }

  return [sqlValue];
}

function getQueryValuesFromJoinObject(joinObject: JoinObject): QueryValue[] {
  const separatorQueryValues = getQueryValuesFromSqlValue(joinObject.separator);

  const queryValues = joinObject.values.reduce(
    (partialQueryValues: QueryValue[], value, valueIndex) => {
      const subQueryValues = getQueryValuesFromSqlValue(value);

      partialQueryValues.push(...subQueryValues);

      if (valueIndex !== joinObject.values.length - 1) {
        partialQueryValues.push(...separatorQueryValues);
      }

      return partialQueryValues;
    },
    [],
  );

  return queryValues;
}

function makeParameterizedQueryString(
  sqlFragments: SqlFragment[],
): QueryString {
  const queryString = sqlFragments.reduce(
    (partialQueryString, queryFragment, index) => {
      if (index === 0) {
        return partialQueryString + queryFragment;
      }

      return partialQueryString + makeParameterString(index) + queryFragment;
    },
    '',
  );

  return queryString;
}
