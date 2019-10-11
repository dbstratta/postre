import { postreSymbol } from './constants';
import { ObjectKind, PostreObject, PrimitiveType } from './types';
import { SqlObject } from './sql';

export type Assignments = Record<string, SqlObject | PrimitiveType>;

export type AssignmentsInput = Record<
  keyof Assignments,
  Assignments[keyof Assignments] | undefined
>;

export type AssignmentObject = PostreObject & {
  kind: ObjectKind.Assignment;
  assignments: Assignments;
};

export function assignment(assignments: AssignmentsInput): AssignmentObject {
  const filteredAssignments = Object.fromEntries(
    Object.entries(assignments).filter(([key, value]) => value !== undefined),
  ) as Assignments;

  return {
    kind: ObjectKind.Assignment,
    assignments: filteredAssignments,
    [postreSymbol]: true,
  };
}
