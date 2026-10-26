import { describe as describeValue } from '@/core/expression/completions'
import type { DataPath } from '@/core/expression/paths'

export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  NULL = 'null',
}

/** One field of the item structure, as listed in the schema view. */
export interface SchemaField {
  readonly key: string
  readonly path: DataPath
  readonly type: FieldType
  /** Short sample value of the first item that has the field. */
  readonly sample: string
  readonly children: readonly SchemaField[]
}

/** Items sampled for the structure; the rest rarely add fields and would cost time on large outputs. */
const SAMPLED_ITEMS = 20
const MAX_DEPTH = 6

export function fieldType(value: unknown): FieldType {
  if (value === null || value === undefined) return FieldType.NULL
  if (Array.isArray(value)) return FieldType.ARRAY
  switch (typeof value) {
    case 'string':
      return FieldType.STRING
    case 'number':
    case 'bigint':
      return FieldType.NUMBER
    case 'boolean':
      return FieldType.BOOLEAN
    default:
      return FieldType.OBJECT
  }
}

/**
 * Field structure of a list of item JSONs: the union of the fields of the first items, nested objects and
 * the first element of arrays included, so any field can be dragged into an expression by its path.
 */
export function schemaOf(items: readonly unknown[]): SchemaField[] {
  return fieldsOf(items.slice(0, SAMPLED_ITEMS), [], 0)
}

function fieldsOf(values: readonly unknown[], path: DataPath, depth: number): SchemaField[] {
  if (depth >= MAX_DEPTH) return []
  const byKey = new Map<string, unknown[]>()
  for (const value of values) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
    for (const [key, field] of Object.entries(value)) {
      const list = byKey.get(key)
      if (list) list.push(field)
      else byKey.set(key, [field])
    }
  }
  return [...byKey].map(([key, fieldValues]) => {
    const present = fieldValues.find((v) => v !== null && v !== undefined)
    const type = fieldType(present)
    const fieldPath = [...path, key]
    const children =
      type === FieldType.OBJECT
        ? fieldsOf(fieldValues, fieldPath, depth + 1)
        : type === FieldType.ARRAY
          ? elementFields(fieldValues as unknown[][], fieldPath, depth)
          : []
    return { key, path: fieldPath, type, sample: type === FieldType.OBJECT || type === FieldType.ARRAY ? '' : describeValue(present), children }
  })
}

/** Arrays are described through their first element, as `[0]`. */
function elementFields(arrays: readonly unknown[][], path: DataPath, depth: number): SchemaField[] {
  const firsts = arrays.filter((a) => Array.isArray(a) && a.length).map((a) => a[0])
  if (!firsts.length) return []
  const type = fieldType(firsts[0])
  const elementPath = [...path, 0]
  return [
    {
      key: '[0]',
      path: elementPath,
      type,
      sample: type === FieldType.OBJECT || type === FieldType.ARRAY ? '' : describeValue(firsts[0]),
      children: type === FieldType.OBJECT ? fieldsOf(firsts, elementPath, depth + 1) : [],
    },
  ]
}
