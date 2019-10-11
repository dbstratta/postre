import { postreSymbol } from './constants';
import { ObjectKind, LogicCondition } from './types';

export type AndObject = {
  kind: ObjectKind.And;
  conditions: LogicCondition[];
  [postreSymbol]: true;
};

export function and(conditions: LogicCondition[]): AndObject {
  const conditionsOrDefault = conditions.length === 0 ? [true] : conditions;

  return {
    kind: ObjectKind.And,
    conditions: conditionsOrDefault,
    [postreSymbol]: true,
  };
}
