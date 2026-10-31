import { NodeGroup, NodeKind, NodeTypeStatus, PropertyType, type NodeTypeDescriptor, type PropertyDescriptor } from '@/core/node-types/descriptor'
import type { Parameters } from '@/core/workflow/model'
import { Service, SERVICE_LABELS, serviceOf } from './services'

/** Top-level groups of "What happens next?", like n8n's node creator. */
export enum CreatorCategory {
  APPS = 'APPS',
  AI = 'AI',
  FLOW = 'FLOW',
  DATA = 'DATA',
  CORE = 'CORE',
  TRIGGERS = 'TRIGGERS',
}

export const CATEGORIES: Readonly<Record<CreatorCategory, { title: string; description: string }>> = {
  [CreatorCategory.APPS]: { title: 'Action in an app', description: 'Send messages and act in Telegram, Viber and other messengers' },
  [CreatorCategory.AI]: { title: 'AI', description: 'Agents that answer with a language model, and their models, memory and tools' },
  [CreatorCategory.FLOW]: { title: 'Flow', description: 'Branch, route and control how items move through the workflow' },
  [CreatorCategory.DATA]: { title: 'Data transformation', description: 'Change, combine and reshape the items' },
  [CreatorCategory.CORE]: { title: 'Core', description: 'HTTP requests and other building blocks' },
  [CreatorCategory.TRIGGERS]: { title: 'Add another trigger', description: 'Start the workflow on another event too' },
}

const NEXT_ORDER: readonly CreatorCategory[] = [
  CreatorCategory.APPS,
  CreatorCategory.AI,
  CreatorCategory.FLOW,
  CreatorCategory.DATA,
  CreatorCategory.CORE,
  CreatorCategory.TRIGGERS,
]

const CATEGORY_OF_GROUP: Readonly<Record<NodeGroup, CreatorCategory>> = {
  [NodeGroup.COMMUNICATION]: CreatorCategory.APPS,
  [NodeGroup.AI]: CreatorCategory.AI,
  [NodeGroup.LOGIC]: CreatorCategory.FLOW,
  [NodeGroup.DATA]: CreatorCategory.DATA,
  [NodeGroup.CORE]: CreatorCategory.CORE,
}

export enum CreatorItemKind {
  /** Adds a node, possibly preset to one operation or event. */
  NODE = 'NODE',
  /** Opens the triggers and actions of an app. */
  APP = 'APP',
  /** Opens a category. */
  CATEGORY = 'CATEGORY',
}

export interface NodeItem {
  readonly kind: CreatorItemKind.NODE
  readonly key: string
  readonly type: NodeTypeDescriptor
  readonly title: string
  readonly description: string
  /** Values over the type's defaults, e.g. `{ operation: 'SEND_MESSAGE' }`. */
  readonly parameters: Parameters
}

export interface AppItem {
  readonly kind: CreatorItemKind.APP
  readonly key: string
  readonly service: Service
  readonly title: string
  readonly description: string
}

export interface CategoryItem {
  readonly kind: CreatorItemKind.CATEGORY
  readonly key: string
  readonly category: CreatorCategory
  readonly title: string
  readonly description: string
}

export type CreatorItem = NodeItem | AppItem | CategoryItem

export interface CreatorSection {
  readonly key: string
  /** Empty for a section that needs no heading. */
  readonly title: string
  readonly items: readonly CreatorItem[]
}

export interface CreatorView {
  readonly key: string
  readonly title: string
  readonly subtitle: string
  readonly sections: readonly CreatorSection[]
}

export interface CreatorOptions {
  /** Whether a node of the type can be added where the creator was opened. */
  readonly fits: (type: NodeTypeDescriptor) => boolean
  /** Whether triggers may be offered (nothing can be wired before them). */
  readonly allowTriggers: boolean
  /** The workflow already has a trigger, so the creator starts at "What happens next?". */
  readonly hasTrigger: boolean
}

/** Properties whose options n8n turns into one entry each: what an action does, what a trigger listens to. */
const OPERATION = 'operation'
const EVENTS = 'events'
const MAX_SEARCH_RESULTS = 40

const byTitle = (a: { title: string }, b: { title: string }): number => a.title.localeCompare(b.title)
const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1)

const optionsOf = (type: NodeTypeDescriptor, name: string, propertyType: PropertyType): PropertyDescriptor | undefined =>
  type.properties.find((p) => p.name === name && p.type === propertyType && p.options.length > 0)

/** The node itself, without a preset. */
const plainItem = (type: NodeTypeDescriptor): NodeItem => ({
  kind: CreatorItemKind.NODE,
  key: type.key,
  type,
  title: type.displayName,
  description: type.description,
  parameters: {},
})

/**
 * Entries a node type offers, like n8n's actions: one per operation of an action node, one per event of a trigger,
 * otherwise the node itself.
 */
export function itemsOf(type: NodeTypeDescriptor): NodeItem[] {
  const operation = optionsOf(type, OPERATION, PropertyType.OPTIONS)
  if (operation) {
    return operation.options.map((option) => ({
      ...plainItem(type),
      key: `${type.key}:${option.value}`,
      title: option.displayName,
      description: option.description || type.displayName,
      // An operation of a resource comes with its resource, or the form would show another resource's operations.
      parameters: operation.optionsFilteredBy
        ? { [operation.optionsFilteredBy]: option.group, [OPERATION]: option.value }
        : { [OPERATION]: option.value },
    }))
  }
  const events = type.kind === NodeKind.TRIGGER ? optionsOf(type, EVENTS, PropertyType.MULTI_OPTIONS) : undefined
  if (events) {
    return events.options.map((option) => ({
      ...plainItem(type),
      key: `${type.key}:${option.value}`,
      title: `On ${lowerFirst(option.displayName)}`,
      description: option.description || type.displayName,
      parameters: { [EVENTS]: [option.value] },
    }))
  }
  return [plainItem(type)]
}

/**
 * Builds the views of the node creator from the node types that fit where it was opened: what triggers the workflow
 * or what happens next, categories, the triggers and actions of an app, and search across all of them.
 */
export class NodeCreatorModel {
  private readonly types: readonly NodeTypeDescriptor[]

  constructor(
    types: readonly NodeTypeDescriptor[],
    private readonly options: CreatorOptions,
  ) {
    this.types = types.filter(
      (type) =>
        type.status !== NodeTypeStatus.DEPRECATED && options.fits(type) && (options.allowTriggers || type.kind !== NodeKind.TRIGGER),
    )
  }

  /** The first view: sub-nodes when only they fit, triggers for a workflow without one, otherwise what happens next. */
  root(): CreatorView {
    if (this.types.length && this.types.every((type) => type.kind === NodeKind.SUPPLY)) {
      return { key: 'sub-nodes', title: 'Add a sub-node', subtitle: 'Attach it to the agent', sections: [this.nodeSection('', this.types)] }
    }
    if (this.options.allowTriggers && !this.options.hasTrigger && this.triggers().length) return this.triggerView()
    const categories = NEXT_ORDER.filter((category) => this.typesOf(category).length).map((category) => this.categoryItem(category))
    return { key: 'next', title: 'What happens next?', subtitle: '', sections: [{ key: 'categories', title: '', items: categories }] }
  }

  /** @returns the view an app or category item opens */
  open(item: AppItem | CategoryItem): CreatorView {
    return item.kind === CreatorItemKind.APP ? this.appView(item.service) : this.categoryView(item.category)
  }

  /** Node entries and actions whose title, description or app matches, best matches first. */
  search(query: string): NodeItem[] {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    const candidates = this.types.flatMap((type) => {
      const items = itemsOf(type)
      // A node split into actions is found by its own name too.
      return items[0]?.key === type.key ? items : [plainItem(type), ...items]
    })
    return candidates
      .map((item) => ({ item, score: scoreOf(item, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || byTitle(a.item, b.item))
      .slice(0, MAX_SEARCH_RESULTS)
      .map(({ item }) => item)
  }

  private triggers(): NodeTypeDescriptor[] {
    return this.types.filter((type) => type.kind === NodeKind.TRIGGER)
  }

  private typesOf(category: CreatorCategory): NodeTypeDescriptor[] {
    if (category === CreatorCategory.TRIGGERS) return this.triggers()
    return this.types.filter((type) => type.kind !== NodeKind.TRIGGER && CATEGORY_OF_GROUP[type.group] === category)
  }

  private triggerView(): CreatorView {
    const triggers = this.triggers()
    const core = triggers.filter((type) => serviceOf(type.name) === null)
    const apps = this.appItems(triggers)
    return {
      key: 'triggers',
      title: 'What triggers this workflow?',
      subtitle: 'A trigger starts the workflow when something happens',
      sections: [
        ...(core.length ? [this.nodeSection('Core', core)] : []),
        ...(apps.length ? [{ key: 'apps', title: 'Apps', items: apps }] : []),
      ],
    }
  }

  private categoryView(category: CreatorCategory): CreatorView {
    if (category === CreatorCategory.TRIGGERS) return this.triggerView()
    const types = this.typesOf(category)
    const { title, description } = CATEGORIES[category]
    if (category === CreatorCategory.APPS) {
      return { key: category, title, subtitle: description, sections: [{ key: 'apps', title: '', items: this.appItems(types) }] }
    }
    const main = types.filter((type) => type.kind !== NodeKind.SUPPLY)
    const supply = types.filter((type) => type.kind === NodeKind.SUPPLY)
    return {
      key: category,
      title,
      subtitle: description,
      sections: [
        ...(main.length ? [this.nodeSection('', main)] : []),
        ...(supply.length ? [this.nodeSection('Sub-nodes: models, memory and tools', supply)] : []),
      ],
    }
  }

  /** Triggers first, then the actions of every node type of the app under its name. */
  private appView(service: Service): CreatorView {
    const types = this.types.filter((type) => serviceOf(type.name) === service).sort((a, b) => a.displayName.localeCompare(b.displayName))
    const triggers = types.filter((type) => type.kind === NodeKind.TRIGGER)
    const actions = types.filter((type) => type.kind !== NodeKind.TRIGGER)
    return {
      key: `app:${service}`,
      title: SERVICE_LABELS[service],
      subtitle: '',
      sections: [
        ...(triggers.length ? [{ key: 'triggers', title: 'Triggers', items: triggers.flatMap(itemsOf) }] : []),
        ...actions.map((type) => ({ key: type.key, title: type.displayName, items: itemsOf(type) })),
      ],
    }
  }

  private appItems(types: readonly NodeTypeDescriptor[]): AppItem[] {
    const services = [...new Set(types.map((type) => serviceOf(type.name)).filter((s): s is Service => s !== null))]
    return services
      .map((service) => {
        const count = types.filter((type) => serviceOf(type.name) === service).flatMap(itemsOf).length
        return {
          kind: CreatorItemKind.APP as const,
          key: `app:${service}`,
          service,
          title: SERVICE_LABELS[service],
          description: `${count} ${count === 1 ? 'entry' : 'entries'}`,
        }
      })
      .sort(byTitle)
  }

  private nodeSection(title: string, types: readonly NodeTypeDescriptor[]): CreatorSection {
    return { key: title || 'nodes', title, items: types.map(plainItem).sort(byTitle) }
  }

  private categoryItem(category: CreatorCategory): CategoryItem {
    return { kind: CreatorItemKind.CATEGORY, key: `category:${category}`, category, ...CATEGORIES[category] }
  }
}

/** Title prefix beats word prefix beats a match anywhere; description and app count less. */
function scoreOf(item: NodeItem, needle: string): number {
  const title = item.title.toLowerCase()
  const app = serviceOf(item.type.name)
  const context = [item.description, item.type.displayName, app ? SERVICE_LABELS[app] : ''].join(' ').toLowerCase()
  if (title.startsWith(needle)) return 4
  if (title.split(/\s+/).some((word) => word.startsWith(needle))) return 3
  if (title.includes(needle)) return 2
  return context.includes(needle) ? 1 : 0
}
