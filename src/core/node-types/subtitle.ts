import type { NodeModel } from '@/core/workflow/model'
import type { NodeTypeDescriptor, PropertyDescriptor } from './descriptor'

/** Parameter values of one node as a subtitle rule reads them: the stored value or the property default. */
export class SubtitleValues {
  constructor(
    private readonly descriptor: NodeTypeDescriptor,
    private readonly parameters: NodeModel['parameters'],
  ) {}

  /** @returns the value as text; expressions are shown as written */
  text(name: string): string {
    const value = this.raw(name)
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
  }

  /** @returns display names of the selected options of an OPTIONS or MULTI_OPTIONS property */
  optionLabels(name: string): string[] {
    const property = this.property(name)
    const value = this.raw(name)
    const selected = Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]
    return selected.map((v) => property?.options.find((o) => o.value === v)?.displayName ?? String(v))
  }

  has(name: string): boolean {
    return this.property(name) !== undefined
  }

  private raw(name: string): unknown {
    return this.parameters[name] ?? this.property(name)?.defaultValue
  }

  private property(name: string): PropertyDescriptor | undefined {
    return this.descriptor.properties.find((p) => p.name === name)
  }
}

/** @returns what the node does, empty when the rule has nothing to say */
export type SubtitleRule = (values: SubtitleValues) => string

const MAX_EVENTS = 2

const joined = (...parts: string[]): string => parts.filter(Boolean).join(': ')

/** Rules of types whose summary is not their operation or events. */
const BY_TYPE: Readonly<Record<string, SubtitleRule>> = {
  'http.request': (v) => joined(v.optionLabels('method')[0] ?? '', v.text('url')),
  'core.webhook': (v) => joined(v.optionLabels('method')[0] ?? '', v.text('path') && `/${v.text('path')}`),
  'core.schedule': (v) => v.text('cron'),
  'ai.model.openai': (v) => v.text('model'),
  'ai.model.anthropic': (v) => v.text('model'),
  'ai.tool.http': (v) => v.text('baseUrl'),
}

/** Most nodes say what they do with an `operation`, triggers with the `events` they listen to. */
const GENERIC: SubtitleRule = (v) => {
  if (v.has('operation')) return v.optionLabels('operation').join(', ')
  if (v.has('events')) {
    const events = v.optionLabels('events')
    if (!events.length) return ''
    const shown = events.slice(0, MAX_EVENTS).join(', ')
    return `On ${shown}${events.length > MAX_EVENTS ? ` +${events.length - MAX_EVENTS}` : ''}`
  }
  return ''
}

/**
 * The line under a node on the canvas, like n8n's subtitle: the operation, the events or the target of the node,
 * falling back to the type name so every node says what it is.
 *
 * @param descriptor node type, undefined when the type is not in the catalog
 * @param node       node whose parameters are summarised
 */
export function subtitleOf(descriptor: NodeTypeDescriptor | undefined, node: Pick<NodeModel, 'type' | 'parameters'>): string {
  if (!descriptor) return `${node.type} (unknown type)`
  const values = new SubtitleValues(descriptor, node.parameters)
  return (BY_TYPE[descriptor.name] ?? GENERIC)(values) || descriptor.displayName
}
