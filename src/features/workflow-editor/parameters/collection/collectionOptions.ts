import type { PropertyDescriptor } from '@/core/node-types/descriptor'

/**
 * Children of a collection that are on show, in declaration order: required ones, ones with a value, and ones the
 * user just added. The rest are offered by "Add option", like n8n's collections.
 */
export function shownChildren(
  children: readonly PropertyDescriptor[],
  values: Readonly<Record<string, unknown>>,
  added: ReadonlySet<string>,
): PropertyDescriptor[] {
  return children.filter((child) => child.required || values[child.name] !== undefined || added.has(child.name))
}

/** @returns children not on show yet, for "Add option" */
export function addableChildren(children: readonly PropertyDescriptor[], shown: readonly PropertyDescriptor[]): PropertyDescriptor[] {
  const names = new Set(shown.map((child) => child.name))
  return children.filter((child) => !names.has(child.name))
}

/** Required children stay; optional ones can be taken out again. */
export const isRemovable = (child: PropertyDescriptor): boolean => !child.required
