import { postreSymbol } from './constants';
import { ObjectKind, PostreObject, PrimitiveType } from './types';
import { SqlObject } from './sql';

export type AssignmentsRecord = Record<string, SqlObject | PrimitiveType>;

export type AssignmentsInput = Record<
  keyof AssignmentsRecord,
  AssignmentsRecord[keyof AssignmentsRecord] | undefined
>;

export type AssignmentsObject = PostreObject & {
  kind: ObjectKind.Assignments;
  assignments: AssignmentsRecord;
};

export function assignments(assignmentList: AssignmentsInput): AssignmentsObject {
  const filteredAssignments = Object.fromEntries(
    Object.entries(assignmentList).filter(([key, value]) => value !== undefined),
  ) as AssignmentsRecord;

  return {
    kind: ObjectKind.Assignments,
    assignments: filteredAssignments,
    [postreSymbol]: true,
  };
}
