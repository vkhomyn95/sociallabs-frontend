import { accessor } from './paths'

export enum CompletionKind {
  VARIABLE = 'VARIABLE',
  FIELD = 'FIELD',
  METHOD = 'METHOD',
  NODE = 'NODE',
}

export interface Completion {
  readonly label: string
  /** Text that replaces the typed prefix. */
  readonly insert: string
  readonly kind: CompletionKind
  /** Type or sample value. */
  readonly detail: string
}

export interface CompletionResult {
  /** Characters before the caret that the chosen completion replaces. */
  readonly replaceLength: number
  readonly items: readonly Completion[]
}

/** Sample data the completions are derived from: what the node saw in the last run. */
export interface CompletionSample {
  /** JSON of the current input item. */
  readonly json: unknown
  /** First output item JSON of nodes upstream of the edited one, by name. */
  readonly nodes: ReadonlyMap<string, unknown>
}

const ROOTS: readonly Completion[] = [
  { label: '$json', insert: '$json', kind: CompletionKind.VARIABLE, detail: 'current item' },
  { label: '$input', insert: '$input', kind: CompletionKind.VARIABLE, detail: 'all input items' },
  { label: '$node', insert: '$node', kind: CompletionKind.VARIABLE, detail: 'output of a previous node' },
  { label: '$itemIndex', insert: '$itemIndex', kind: CompletionKind.VARIABLE, detail: 'index of the current item' },
  { label: '$now', insert: '$now', kind: CompletionKind.VARIABLE, detail: 'current time' },
  { label: '$today', insert: '$today', kind: CompletionKind.VARIABLE, detail: 'start of today' },
  { label: '$execution', insert: '$execution', kind: CompletionKind.VARIABLE, detail: 'id and mode of the run' },
  { label: '$workflow', insert: '$workflow', kind: CompletionKind.VARIABLE, detail: 'workflow id' },
  { label: 'Math', insert: 'Math', kind: CompletionKind.VARIABLE, detail: 'round, max, min…' },
]

const method = (label: string, detail: string): Completion => ({ label, insert: label, kind: CompletionKind.METHOD, detail })

const MEMBERS: Readonly<Record<string, readonly Completion[]>> = {
  $input: [method('item', 'current item'), method('first()', 'first item'), method('last()', 'last item'), method('all()', 'all items')],
  $execution: [method('id', 'execution id'), method('mode', 'TRIGGER, MANUAL or RETRY')],
  $workflow: [method('workflowId', 'workflow id')],
  $now: [method("format('yyyy-MM-dd')", 'formatted text'), method('plusDays(1)', 'shifted time'), method('getDay()', 'day of month')],
  Math: [method('round()', 'nearest integer'), method('max()', 'largest'), method('min()', 'smallest'), method('abs()', 'absolute value')],
}

const NODE_MEMBERS: readonly Completion[] = [method('json', 'first item'), method('output(0)', 'items of an output port')]

/**
 * Suggestions while typing inside `{{ }}`, derived from the run data of the edited node: the fields of
 * the current item, upstream node names and the fields of their output, and the built-in variables.
 * It understands member chains (`$json.message.te`), bracket access and `$node['Name'].json.`.
 */
export class ExpressionCompletions {
  constructor(private readonly sample: CompletionSample) {}

  /**
   * @param before expression source up to the caret
   * @returns suggestions for the token at the caret, empty when there are none
   */
  complete(before: string): CompletionResult {
    const nodeName = /\$node\[\s*(['"])([^'"]*)$/.exec(before)
    if (nodeName) {
      const typed = nodeName[2]!
      const quote = nodeName[1]!
      const items = [...this.sample.nodes.keys()]
        .filter((name) => startsWith(name, typed))
        .map((name): Completion => ({ label: name, insert: `${name}${quote}]`, kind: CompletionKind.NODE, detail: 'node' }))
      return { replaceLength: typed.length, items }
    }

    const chain = /((?:\$[A-Za-z_]*|[A-Za-z_][A-Za-z0-9_]*)(?:\.[A-Za-z0-9_$]+|\[[^\]]*\]|\(\))*)\.([A-Za-z0-9_$]*)$/.exec(before)
    if (chain) {
      const typed = chain[2]!
      return { replaceLength: typed.length, items: this.members(chain[1]!).filter((c) => startsWith(c.label, typed)) }
    }

    const root = /(\$?[A-Za-z_][A-Za-z0-9_]*|\$)$/.exec(before)
    const typed = root?.[1] ?? ''
    // Directly after an identifier character that is not part of a root (e.g. a number) nothing is suggested.
    if (!root && /[A-Za-z0-9_)\]]$/.test(before)) return { replaceLength: 0, items: [] }
    return { replaceLength: typed.length, items: ROOTS.filter((c) => startsWith(c.label, typed)) }
  }

  private members(target: string): Completion[] {
    if (target === '$node') {
      return [...this.sample.nodes.keys()].map((name) => ({
        label: name,
        // Dot access only works for identifier names; others go through brackets.
        insert: accessor(name).startsWith('.') ? name : `['${name}']`,
        kind: CompletionKind.NODE,
        detail: 'node',
      }))
    }
    const nodeMatch = /^\$node(?:\.([A-Za-z_$][A-Za-z0-9_$]*)|\[\s*['"]([^'"]+)['"]\s*\])(.*)$/.exec(target)
    if (nodeMatch) {
      const name = nodeMatch[1] ?? nodeMatch[2]!
      const rest = nodeMatch[3]!
      if (!rest) return [...NODE_MEMBERS]
      const json = /^\.json(.*)$/.exec(rest)
      return json ? fieldsOf(resolve(this.sample.nodes.get(name), json[1]!)) : []
    }
    const item = /^\$json(.*)$/.exec(target)
    if (item) return fieldsOf(resolve(this.sample.json, item[1]!))
    const inputItem = /^\$input\.(?:item|first\(\)|last\(\))(.*)$/.exec(target)
    if (inputItem) {
      const json = /^\.json(.*)$/.exec(inputItem[1]!)
      return inputItem[1] ? (json ? fieldsOf(resolve(this.sample.json, json[1]!)) : []) : [method('json', 'item data')]
    }
    return [...(MEMBERS[target] ?? [])]
  }
}

const startsWith = (label: string, typed: string): boolean => label.toLowerCase().startsWith(typed.toLowerCase())

/** Walk `.a[0]['b c']` accessors through sample data; undefined when the path does not exist. */
function resolve(data: unknown, accessors: string): unknown {
  const pattern = /\.([A-Za-z0-9_$]+)|\[\s*(\d+)\s*\]|\[\s*(['"])(.*?)\3\s*\]/g
  let current = data
  let consumed = 0
  for (const match of accessors.matchAll(pattern)) {
    if (match.index !== consumed) return undefined
    consumed += match[0].length
    const key = match[1] ?? match[4] ?? Number(match[2])
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[key]
  }
  return consumed === accessors.length ? current : undefined
}

function fieldsOf(value: unknown): Completion[] {
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((element, i) => ({ label: `[${i}]`, insert: `[${i}]`, kind: CompletionKind.FIELD, detail: describe(element) }))
  }
  if (value === null || typeof value !== 'object') return []
  return Object.entries(value as Record<string, unknown>).map(([key, field]) => ({
    label: key,
    insert: accessor(key).startsWith('.') ? key : `['${key}']`,
    kind: CompletionKind.FIELD,
    detail: describe(field),
  }))
}

/** Short type or value hint shown next to a field. */
export function describe(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return `array[${value.length}]`
  if (typeof value === 'object') return 'object'
  const text = String(value)
  return typeof value === 'string' ? `"${text.length > 30 ? `${text.slice(0, 30)}…` : text}"` : text
}
