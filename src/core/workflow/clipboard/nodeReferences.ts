import type { Parameters } from '../model'

/** Old node name → new node name. */
export type NodeRenames = ReadonlyMap<string, string>

/** `$node['Name']` or `$node["Name"]`; group 1 is the quote, group 2 the escaped name. */
const BRACKET_REFERENCE = /\$node\[\s*(['"])((?:\\.|(?!\1)[^\\])*)\1\s*\]/g

/** `$node.Name` for names that are identifiers. */
const DOT_REFERENCE = /\$node\.([A-Za-z_$][A-Za-z0-9_$]*)/g

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const unescape = (text: string): string => text.replace(/\\(.)/g, '$1')

const escapeFor = (quote: string, text: string): string =>
  text.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), `\\${quote}`)

/**
 * Point expressions in a text at renamed nodes.
 *
 * @param text    parameter text, possibly with `{{ … }}` templates
 * @param renames node renames
 * @returns text with references to renamed nodes rewritten
 */
export function renameReferencesInText(text: string, renames: NodeRenames): string {
  if (!text.includes('$node')) return text
  return text
    .replace(BRACKET_REFERENCE, (match, quote: string, escaped: string) => {
      const renamed = renames.get(unescape(escaped))
      return renamed === undefined ? match : `$node[${quote}${escapeFor(quote, renamed)}${quote}]`
    })
    .replace(DOT_REFERENCE, (match, name: string) => {
      const renamed = renames.get(name)
      if (renamed === undefined) return match
      return IDENTIFIER.test(renamed) ? `$node.${renamed}` : `$node['${escapeFor("'", renamed)}']`
    })
}

function renameInValue(value: unknown, renames: NodeRenames): unknown {
  if (typeof value === 'string') return renameReferencesInText(value, renames)
  if (Array.isArray(value)) return value.map((item) => renameInValue(item, renames))
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renameInValue(item, renames)]))
  }
  return value
}

/**
 * Rewrite references to renamed nodes anywhere in a node's parameters, nested lists and groups included.
 *
 * @param parameters node parameters
 * @param renames    node renames; an empty map returns the parameters unchanged
 * @returns new parameters
 */
export function renameNodeReferences(parameters: Parameters, renames: NodeRenames): Parameters {
  if (!renames.size) return parameters
  return renameInValue(parameters, renames) as Parameters
}
