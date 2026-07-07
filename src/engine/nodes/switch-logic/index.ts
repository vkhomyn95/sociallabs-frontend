import { type IfCondition, LogicOperation } from '../if-logic'

export { LogicOperation } from '../if-logic'

export enum SwitchMode {
  RULES      = 'RULES',
  EXPRESSION = 'EXPRESSION',
}

export interface SwitchCondition extends IfCondition {}

export interface SwitchRule {
  outputIndex:      number
  outputName:       string
  conditions:       SwitchCondition[]
  combineOperation: 'AND' | 'OR'
}

export interface SwitchLogicParams {
  mode:            SwitchMode
  rules:           SwitchRule[]
  expression:      string
  fallbackEnabled: boolean
}

export const RULE_COLORS = [
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#6366f1',
]

export function emptyRule(index: number): SwitchRule {
  return {
    outputIndex:      index,
    outputName:       `Output ${index + 1}`,
    conditions:       [{ leftValue: '', operation: LogicOperation.EQUALS, rightValue: '', type: 'STRING' }],
    combineOperation: 'AND',
  }
}

export function emptyCondition(): SwitchCondition {
  return { leftValue: '', operation: LogicOperation.EQUALS, rightValue: '', type: 'STRING' }
}
