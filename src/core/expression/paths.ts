/** Builds expression accessors for data paths, e.g. when a field is dragged from the input panel. */

export type DataPath = readonly (string | number)[]

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const quote = (text: string): string => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

/** `.name` for identifiers, `['odd key']` or `[0]` otherwise. */
export function accessor(segment: string | number): string {
  if (typeof segment === 'number') return `[${segment}]`
  return IDENTIFIER.test(segment) ? `.${segment}` : `[${quote(segment)}]`
}

/** @returns `$json.message.text` style accessor of a path in the current item */
export function itemPath(path: DataPath): string {
  return `$json${path.map(accessor).join('')}`
}

/** @returns `$node['Name'].json.a` style accessor of a path in the first item of another node */
export function nodePath(nodeName: string, path: DataPath): string {
  return `$node[${quote(nodeName)}].json${path.map(accessor).join('')}`
}

/** Wrap an accessor so it can be dropped into any parameter as a template. */
export const asTemplate = (expression: string): string => `{{ ${expression} }}`
