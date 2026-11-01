import {
  NodeKind,
  PropertyType,
  type NodeTypeDescriptor,
  type PropertyDescriptor,
  type PropertyOption,
} from '@/core/node-types/descriptor'
import { CreatorItemKind, type NodeItem } from './creatorTypes'

/** Properties whose options n8n turns into one entry each: what an action does, what a trigger listens to. */
const OPERATION = 'operation'
const LEGACY_EVENTS = 'events'

/**
 * The entries of a node type under one heading: the operations of a resource, the events of a trigger's group; one
 * group without a title when the type has no such headings.
 */
export interface EntryGroup {
  readonly key: string
  readonly title: string
  readonly items: readonly NodeItem[]
}

/** Turns a node type into the entries the node creator offers, when the type has the shape it knows. */
interface EntryExpander {
  expand(type: NodeTypeDescriptor): EntryGroup[] | null
}

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1)

const optionsProperty = (type: NodeTypeDescriptor, name: string, propertyType: PropertyType): PropertyDescriptor | undefined =>
  type.properties.find((p) => p.name === name && p.type === propertyType && p.options.length > 0)

/** The node itself, without a preset. */
export const plainItem = (type: NodeTypeDescriptor): NodeItem => ({
  kind: CreatorItemKind.NODE,
  key: type.key,
  type,
  title: type.displayName,
  description: type.description,
  parameters: {},
})

const eventTitle = (displayName: string): string => `On ${lowerFirst(displayName)}`

/** Operations grouped into resources: one group per resource, each operation preset with its resource. */
class ResourceOperations implements EntryExpander {
  expand(type: NodeTypeDescriptor): EntryGroup[] | null {
    const operation = optionsProperty(type, OPERATION, PropertyType.OPTIONS)
    const resourceName = operation?.optionsFilteredBy
    if (!operation || !resourceName) return null
    const resources = type.properties.find((p) => p.name === resourceName)?.options ?? []
    return resources.map((resource) => ({
      key: `${type.key}:${resource.value}`,
      title: resource.displayName,
      items: operation.options
        .filter((option) => option.group === resource.value)
        .map((option) => ({
          ...plainItem(type),
          key: `${type.key}:${option.value}`,
          title: option.displayName,
          description: option.description || resource.displayName,
          parameters: { [resourceName]: resource.value, [OPERATION]: option.value },
        })),
    }))
  }
}

/**
 * A trigger whose choice is a group of events, each group with its own list of events: one group of entries per
 * group, one entry per event, preset with the group and that event.
 */
class TriggerEventGroups implements EntryExpander {
  expand(type: NodeTypeDescriptor): EntryGroup[] | null {
    const groups = optionsProperty(type, OPERATION, PropertyType.OPTIONS)
    if (type.kind !== NodeKind.TRIGGER || !groups) return null
    const expanded = groups.options.map((group) => this.groupOf(type, group))
    // Every group needs its own events, or the trigger is not of this shape.
    if (expanded.some((group) => group === null)) return null
    return expanded.filter((group): group is EntryGroup => group !== null)
  }

  private groupOf(type: NodeTypeDescriptor, group: PropertyOption): EntryGroup | null {
    const events = this.eventsOf(type, group.value)
    if (!events) return null
    const items: NodeItem[] = events.options.map((event) => ({
      ...plainItem(type),
      key: `${type.key}:${group.value}:${event.value}`,
      title: eventTitle(event.displayName),
      description: event.description || group.displayName,
      parameters: { [OPERATION]: group.value, [events.name]: [event.value] },
    }))
    return { key: `${type.key}:${group.value}`, title: group.displayName, items }
  }

  /** The list of events shown only for this group. */
  private eventsOf(type: NodeTypeDescriptor, group: string): PropertyDescriptor | undefined {
    return type.properties.find(
      (p) =>
        p.type === PropertyType.MULTI_OPTIONS &&
        p.options.length > 0 &&
        p.show.some((condition) => condition.field === OPERATION && condition.values.length === 1 && condition.values[0] === group),
    )
  }
}

/** Operations without resources: one entry each. */
class FlatOperations implements EntryExpander {
  expand(type: NodeTypeDescriptor): EntryGroup[] | null {
    const operation = optionsProperty(type, OPERATION, PropertyType.OPTIONS)
    if (!operation) return null
    const items = operation.options.map((option) => ({
      ...plainItem(type),
      key: `${type.key}:${option.value}`,
      title: option.displayName,
      description: option.description || type.displayName,
      parameters: { [OPERATION]: option.value },
    }))
    return [{ key: type.key, title: '', items }]
  }
}

/** A trigger with one flat list of events: one entry per event. */
class FlatEvents implements EntryExpander {
  expand(type: NodeTypeDescriptor): EntryGroup[] | null {
    const events = type.kind === NodeKind.TRIGGER ? optionsProperty(type, LEGACY_EVENTS, PropertyType.MULTI_OPTIONS) : undefined
    if (!events) return null
    const items = events.options.map((option) => ({
      ...plainItem(type),
      key: `${type.key}:${option.value}`,
      title: eventTitle(option.displayName),
      description: option.description || type.displayName,
      parameters: { [LEGACY_EVENTS]: [option.value] },
    }))
    return [{ key: type.key, title: '', items }]
  }
}

/** Most specific shape first; a type of no known shape is offered as itself. */
const EXPANDERS: readonly EntryExpander[] = [
  new ResourceOperations(),
  new TriggerEventGroups(),
  new FlatOperations(),
  new FlatEvents(),
]

/** @returns the entries of a node type under their headings, like n8n's actions and trigger events */
export function entryGroupsOf(type: NodeTypeDescriptor): EntryGroup[] {
  for (const expander of EXPANDERS) {
    const groups = expander.expand(type)
    if (groups) return groups
  }
  return [{ key: type.key, title: '', items: [plainItem(type)] }]
}

/** @returns every entry of a node type */
export function itemsOf(type: NodeTypeDescriptor): NodeItem[] {
  return entryGroupsOf(type).flatMap((group) => [...group.items])
}
