import { postreSymbol } from './constants';
import { ObjectKind, LogicCondition } from './types';

export type OrObject = {
  kind: ObjectKind.Or;
  conditions: LogicCondition[];
  [postreSymbol]: true;
};

export function or(conditions: LogicCondition[]): OrObject {
  const conditionsOrDefault = conditions.length === 0 ? [false] : conditions;

  return {
    kind: ObjectKind.Or,
    conditions: conditionsOrDefault,
    [postreSymbol]: true,
  };
}
