import { describe, expect, it } from 'vitest'
import { NodeGroup, NodeKind, PortKind, PropertyType, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { nodeType, option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { CreatorCategory, CreatorItemKind, NodeCreatorModel, type CategoryItem, type CreatorView } from '../creatorModel'
import { fits, InsertMode, type InsertTarget } from '../insertTarget'

const TYPES: NodeTypeDescriptor[] = [
  nodeType({ key: 'core.webhook@1', name: 'core.webhook', displayName: 'Webhook', kind: NodeKind.TRIGGER, inputs: [] }),
  nodeType({
    key: 'telegram.botTrigger@1',
    name: 'telegram.botTrigger',
    displayName: 'Telegram bot trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    properties: [property('events', { type: PropertyType.MULTI_OPTIONS, options: [option('New message'), option('Reaction')] })],
  }),
  nodeType({
    key: 'telegram.botAction@1',
    name: 'telegram.botAction',
    displayName: 'Telegram bot action',
    group: NodeGroup.COMMUNICATION,
    properties: [property('operation', { type: PropertyType.OPTIONS, options: [option('Send message'), option('Edit message')] })],
  }),
  nodeType({
    key: 'telegram.accountAction@2',
    name: 'telegram.accountAction',
    version: 2,
    displayName: 'Telegram account',
    group: NodeGroup.COMMUNICATION,
    properties: [
      property('resource', { type: PropertyType.OPTIONS, options: [option('MESSAGE'), option('CHAT')] }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [option('SEND_TEXT', 'MESSAGE'), option('LEAVE_CHAT', 'CHAT')],
      }),
    ],
  }),
  nodeType({ key: 'core.if@1', name: 'core.if', displayName: 'IF', group: NodeGroup.LOGIC }),
  nodeType({ key: 'ai.agent@1', name: 'ai.agent', displayName: 'AI Agent', group: NodeGroup.AI }),
  nodeType({
    key: 'ai.model.openai@1',
    name: 'ai.model.openai',
    displayName: 'OpenAI chat model',
    group: NodeGroup.AI,
    kind: NodeKind.SUPPLY,
    inputs: [],
    outputs: [{ name: 'model', displayName: 'Model', kind: PortKind.AI_MODEL, show: [] }],
  }),
]

const at = { x: 0, y: 0 }
const model = (target: InsertTarget, hasTrigger = false) =>
  new NodeCreatorModel(TYPES, {
    fits: (type) => fits(type, target),
    allowTriggers: target.mode === InsertMode.FREE || target.mode === InsertMode.BEFORE,
    hasTrigger,
  })

const titles = (view: CreatorView) => view.sections.map((section) => [section.title, section.items.map((item) => item.title)])

describe('NodeCreatorModel', () => {
  it('asks for a trigger first in a workflow without one: core triggers, then apps', () => {
    expect(titles(model({ mode: InsertMode.FREE, position: at }).root())).toEqual([
      ['Core', ['Webhook']],
      ['Apps', ['Telegram']],
    ])
  })

  it('offers categories of what happens next, with another trigger last', () => {
    const root = model({ mode: InsertMode.FREE, position: at }, true).root()
    expect(root.title).toBe('What happens next?')
    expect(root.sections[0]!.items.map((item) => (item as CategoryItem).category)).toEqual([
      CreatorCategory.APPS,
      CreatorCategory.AI,
      CreatorCategory.FLOW,
      CreatorCategory.TRIGGERS,
    ])
  })

  it('opens an app with its triggers as events and its actions as operations, preset', () => {
    const creator = model({ mode: InsertMode.FREE, position: at }, true)
    const app = creator.open(creator.open(creator.root().sections[0]!.items[0] as CategoryItem).sections[0]!.items[0] as never)
    expect(titles(app)).toEqual([
      ['Triggers', ['On new message', 'On reaction']],
      ['Telegram account', ['SEND_TEXT', 'LEAVE_CHAT']],
      ['Telegram bot action', ['Send message', 'Edit message']],
    ])
    const send = app.sections[2]!.items[0]!
    expect(send.kind === CreatorItemKind.NODE && send.parameters).toEqual({ operation: 'Send message' })
  })

  it('presets the resource of an operation that belongs to one', () => {
    const leave = model({ mode: InsertMode.FREE, position: at }, true)
      .search('leave_chat')
      .find((item) => item.key === 'telegram.accountAction@2:LEAVE_CHAT')
    expect(leave?.parameters).toEqual({ resource: 'CHAT', operation: 'LEAVE_CHAT' })
  })

  it('offers no triggers after an output, and only matching sub-nodes for an agent input', () => {
    const after = model({ mode: InsertMode.AFTER, position: at, node: 'a', output: 0 })
    expect(after.root().sections[0]!.items.map((item) => item.title)).not.toContain('Add another trigger')
    expect(after.search('webhook')).toEqual([])

    const subNode = model({ mode: InsertMode.SUB_NODE, position: at, node: 'agent', input: 1, kind: PortKind.AI_MODEL })
    expect(titles(subNode.root())).toEqual([['', ['OpenAI chat model']]])
  })

  it('finds actions and nodes, title prefixes first', () => {
    const results = model({ mode: InsertMode.FREE, position: at }, true).search('mess')
    expect(results.map((item) => item.title)).toEqual(['Edit message', 'On new message', 'Send message'])
    expect(model({ mode: InsertMode.FREE, position: at }).search('telegram bot')[0]!.title).toBe('Telegram bot action')
  })
})

describe('fits', () => {
  it('needs a main input after an output and a main output before an input', () => {
    const [webhook, , action] = TYPES
    expect(fits(webhook!, { mode: InsertMode.AFTER, position: at, node: 'a', output: 0 })).toBe(false)
    expect(fits(webhook!, { mode: InsertMode.BEFORE, position: at, node: 'a', input: 0 })).toBe(true)
    expect(fits(action!, { mode: InsertMode.AFTER, position: at, node: 'a', output: 0 })).toBe(true)
  })
})
