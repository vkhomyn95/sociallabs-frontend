import { NodeGroup, NodeKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { Parameters } from '@/core/workflow/model'
import type { Service } from './services'
import type { AppVariant } from './variants'

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

export const NEXT_ORDER: readonly CreatorCategory[] = [
  CreatorCategory.APPS,
  CreatorCategory.AI,
  CreatorCategory.FLOW,
  CreatorCategory.DATA,
  CreatorCategory.CORE,
  CreatorCategory.TRIGGERS,
]

export const CATEGORY_OF_GROUP: Readonly<Record<NodeGroup, CreatorCategory>> = {
  [NodeGroup.COMMUNICATION]: CreatorCategory.APPS,
  [NodeGroup.AI]: CreatorCategory.AI,
  [NodeGroup.LOGIC]: CreatorCategory.FLOW,
  [NodeGroup.DATA]: CreatorCategory.DATA,
  [NodeGroup.CORE]: CreatorCategory.CORE,
}

/** What an app's view lists: the events that start a workflow, or what its nodes do once it runs. */
export enum EntryScope {
  TRIGGERS = 'TRIGGERS',
  ACTIONS = 'ACTIONS',
}

export const SCOPE_NOUNS: Readonly<Record<EntryScope, { one: string; many: string }>> = {
  [EntryScope.TRIGGERS]: { one: 'trigger', many: 'triggers' },
  [EntryScope.ACTIONS]: { one: 'action', many: 'actions' },
}

/** @returns the scope a node type's entries belong to */
export const scopeOf = (type: NodeTypeDescriptor): EntryScope =>
  type.kind === NodeKind.TRIGGER ? EntryScope.TRIGGERS : EntryScope.ACTIONS

export enum CreatorItemKind {
  /** Adds a node, possibly preset to one operation or event. */
  NODE = 'NODE',
  /** Opens the triggers and actions of an app. */
  APP = 'APP',
  /** Opens the triggers and actions of one way to use an app, e.g. as an account or as a bot. */
  VARIANT = 'VARIANT',
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
  /** Only the app's triggers or only its actions, as where it was opened from. */
  readonly scope: EntryScope
  readonly title: string
  readonly description: string
}

export interface VariantItem {
  readonly kind: CreatorItemKind.VARIANT
  readonly key: string
  readonly service: Service
  readonly variant: AppVariant
  readonly scope: EntryScope
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

export type CreatorItem = NodeItem | AppItem | VariantItem | CategoryItem

/** Items that open another view instead of adding a node. */
export type OpeningItem = AppItem | VariantItem | CategoryItem

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
