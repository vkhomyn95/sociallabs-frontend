import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import type { FieldPath } from '@/core/node-types/parameters'

/** Props every parameter field component receives; fields emit `update:modelValue` with the new value. */
export interface FieldProps<T = unknown> {
  property: PropertyDescriptor
  modelValue: T | undefined
  /** Location of the field, for nested validation issues. */
  path: FieldPath
  /** Issues of the whole form by path; nested forms look up their own. */
  issues: ReadonlyMap<FieldPath, string>
  /** `name@version` of the node type, for per-type field overrides. */
  typeKey: string
}

export interface FieldEmits<T = unknown> {
  'update:modelValue': [value: T | undefined]
}
