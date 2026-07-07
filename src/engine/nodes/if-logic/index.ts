export enum IfCombineOperation {
  AND = 'AND',
  OR  = 'OR',
}

export enum LogicOperation {
  EQUALS       = 'EQUALS',
  NOT_EQUALS   = 'NOT_EQUALS',
  CONTAINS     = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH  = 'STARTS_WITH',
  ENDS_WITH    = 'ENDS_WITH',
  IS_EMPTY     = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  GT           = 'GT',
  LT           = 'LT',
  GTE          = 'GTE',
  LTE          = 'LTE',
  REGEX        = 'REGEX',
  IS_TRUE      = 'IS_TRUE',
  IS_FALSE     = 'IS_FALSE',
}

export interface IfCondition {
  leftValue:  string
  operation:  LogicOperation
  rightValue: string
  type:       'STRING' | 'NUMBER' | 'BOOLEAN'
}

export interface IfLogicParams {
  combineOperation: IfCombineOperation
  conditions:       IfCondition[]
}

export const UNARY_OPERATIONS = new Set<LogicOperation>([
  LogicOperation.IS_EMPTY,
  LogicOperation.IS_NOT_EMPTY,
  LogicOperation.IS_TRUE,
  LogicOperation.IS_FALSE,
])

export const OPERATION_LABELS: Record<LogicOperation, string> = {
  [LogicOperation.EQUALS]:       'equals',
  [LogicOperation.NOT_EQUALS]:   'not equals',
  [LogicOperation.CONTAINS]:     'contains',
  [LogicOperation.NOT_CONTAINS]: 'not contains',
  [LogicOperation.STARTS_WITH]:  'starts with',
  [LogicOperation.ENDS_WITH]:    'ends with',
  [LogicOperation.IS_EMPTY]:     'is empty',
  [LogicOperation.IS_NOT_EMPTY]: 'is not empty',
  [LogicOperation.GT]:           'greater than',
  [LogicOperation.LT]:           'less than',
  [LogicOperation.GTE]:          '≥',
  [LogicOperation.LTE]:          '≤',
  [LogicOperation.REGEX]:        'regex match',
  [LogicOperation.IS_TRUE]:      'is true',
  [LogicOperation.IS_FALSE]:     'is false',
}

export function emptyCondition(): IfCondition {
  return { leftValue: '', operation: LogicOperation.EQUALS, rightValue: '', type: 'STRING' }
}

export function needsRightValue(op: LogicOperation): boolean {
  return !UNARY_OPERATIONS.has(op)
}
