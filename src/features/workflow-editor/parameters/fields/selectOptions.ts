import type { SelectOption } from '@sociallabs/frontend-components'
import type { PropertyOption } from '@/core/node-types/descriptor'

/** A choice of the schema as the select shows it: under its group's heading, with its description as a second line. */
export function selectOptionOf(option: PropertyOption): SelectOption {
  return {
    value: option.value,
    label: option.displayName,
    description: option.description || undefined,
    group: option.group || undefined,
  }
}
