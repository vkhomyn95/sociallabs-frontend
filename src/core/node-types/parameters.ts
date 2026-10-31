import { isExpression } from '@/core/expression/template'
import { PropertyType, type DisplayCondition, type PropertyDescriptor } from './descriptor'

export type ParameterValues = Readonly<Record<string, unknown>>

/** Location of a field within the parameters, e.g. `rules[2].value`; used to key validation issues. */
export type FieldPath = string

export const childPath = (parent: FieldPath, name: string): FieldPath => (parent ? `${parent}.${name}` : name)
export const elementPath = (parent: FieldPath, index: number): FieldPath => `${parent}[${index}]`
/** @returns the path of the property in the node type's schema: the field path without element indexes */
export const schemaPath = (path: FieldPath): string => path.replace(/\[\d+]/g, '')

/**
 * Parameter values a new node or a new collection element starts with: the declared defaults. A collection
 * ("Options") starts empty, as in n8n; an option gets its default when it is added.
 */
export function defaultParameters(properties: readonly PropertyDescriptor[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const property of properties) {
    if (property.defaultValue !== undefined && property.defaultValue !== null) {
      values[property.name] = structuredClone(property.defaultValue)
    }
  }
  return values
}

/** Current value of a field, or its default when it has none. */
export function effectiveValue(property: PropertyDescriptor, values: ParameterValues): unknown {
  const value = values[property.name]
  return value === undefined ? property.defaultValue : value
}

/**
 * Whether a field is shown for the current values of its siblings (n8n displayOptions): every `show`
 * condition must match and no `hide` condition may. Conditions compare the text form of the value, as the
 * backend declares them ("true", enum constant names); a list matches when any element does.
 *
 * @param property field to check
 * @param values   values of the record the field belongs to
 * @param siblings fields of that record, for the defaults of unset siblings
 */
export function isVisible(property: PropertyDescriptor, values: ParameterValues, siblings: readonly PropertyDescriptor[]): boolean {
  return conditionsHold(property.show, values, siblings) && !property.hide.some((condition) => conditionHolds(condition, values, siblings))
}

/** Whether every condition holds for the values, unset fields counting with their defaults. */
export function conditionsHold(
  conditions: readonly DisplayCondition[],
  values: ParameterValues,
  properties: readonly PropertyDescriptor[],
): boolean {
  return conditions.every((condition) => conditionHolds(condition, values, properties))
}

function conditionHolds(condition: DisplayCondition, values: ParameterValues, properties: readonly PropertyDescriptor[]): boolean {
  const property = properties.find((p) => p.name === condition.field)
  const value = property ? effectiveValue(property, values) : values[condition.field]
  const texts = (Array.isArray(value) ? value : [value]).map((v) => String(v ?? false))
  return texts.some((text) => condition.values.includes(text))
}

/** Why a field value is not acceptable. */
export enum IssueKind {
  REQUIRED = 'REQUIRED',
  NOT_A_NUMBER = 'NOT_A_NUMBER',
  UNKNOWN_OPTION = 'UNKNOWN_OPTION',
}

export interface FieldIssue {
  readonly path: FieldPath
  readonly kind: IssueKind
  readonly message: string
}

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

/**
 * Checks visible fields the way the backend binder will: required values, numbers and option values.
 * Expressions are not checked; they are resolved per item at run time.
 *
 * @returns issues in field order, empty when the parameters are valid
 */
export function validateParameters(
  properties: readonly PropertyDescriptor[],
  values: ParameterValues,
  path: FieldPath = '',
): FieldIssue[] {
  const issues: FieldIssue[] = []
  for (const property of properties) {
    if (!isVisible(property, values, properties)) continue
    const fieldPath = childPath(path, property.name)
    const value = effectiveValue(property, values)
    if (isEmpty(value)) {
      if (property.required) issues.push({ path: fieldPath, kind: IssueKind.REQUIRED, message: `${property.displayName} is required` })
      continue
    }
    if (isExpression(value)) continue
    issues.push(...valueIssues(property, value, fieldPath))
  }
  return issues
}

function valueIssues(property: PropertyDescriptor, value: unknown, path: FieldPath): FieldIssue[] {
  switch (property.type) {
    case PropertyType.NUMBER:
      return typeof value === 'number' && Number.isFinite(value)
        ? []
        : [{ path, kind: IssueKind.NOT_A_NUMBER, message: `${property.displayName} must be a number` }]
    case PropertyType.OPTIONS:
    case PropertyType.MULTI_OPTIONS: {
      const known = new Set(property.options.map((o) => o.value))
      const unknown = (Array.isArray(value) ? value : [value]).filter((v) => !known.has(String(v)))
      return unknown.length
        ? [{ path, kind: IssueKind.UNKNOWN_OPTION, message: `Unknown ${property.displayName.toLowerCase()}: ${unknown.join(', ')}` }]
        : []
    }
    case PropertyType.COLLECTION:
      return isRecord(value) ? validateParameters(property.children, value, path) : []
    case PropertyType.FIXED_COLLECTION:
      return Array.isArray(value)
        ? value.flatMap((element, i) => (isRecord(element) ? validateParameters(property.children, element, elementPath(path, i)) : []))
        : []
    default:
      return []
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
