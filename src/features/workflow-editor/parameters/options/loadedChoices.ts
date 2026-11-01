import type { SelectOption } from '@sociallabs/frontend-components'
import type { PropertyOption } from '@/core/node-types/descriptor'

/**
 * Select options of loaded choices. A value that is not among them (typed by ID, or no longer listed) is kept as
 * an option of its own, so the select never shows a stored value as empty.
 */
export function choiceOptions(choices: readonly PropertyOption[], value: string | undefined): SelectOption[] {
  const options: SelectOption[] = choices.map((choice) => ({ value: choice.value, label: choice.displayName }))
  if (value && !choices.some((choice) => choice.value === value)) options.unshift({ value, label: `${value} (not in the list)` })
  return options
}

/**
 * Select options of loaded choices for a list: each value not among them is kept as an option of its own, after the
 * choices' descriptions (e.g. the kind of a chat) became their secondary line.
 */
export function choiceListOptions(choices: readonly PropertyOption[], values: readonly string[]): SelectOption[] {
  const known = new Set(choices.map((choice) => choice.value))
  const unlisted: SelectOption[] = values
    .filter((value) => !known.has(value))
    .map((value) => ({ value, label: value, description: 'Not in the list' }))
  const listed: SelectOption[] = choices.map((choice) => ({
    value: choice.value,
    label: choice.displayName,
    description: choice.description || undefined,
  }))
  return [...unlisted, ...listed]
}

/** @returns help text of the chosen value: its description, or its id when the label differs */
export function choiceHint(choices: readonly PropertyOption[], value: string | undefined): string | undefined {
  const chosen = choices.find((choice) => choice.value === value)
  if (!chosen) return undefined
  return chosen.description || (chosen.displayName !== chosen.value ? chosen.value : undefined)
}
