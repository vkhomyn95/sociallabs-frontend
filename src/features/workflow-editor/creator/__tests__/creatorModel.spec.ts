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

  it('opens an app with its triggers as events and its actions by resource, preset', () => {
    const creator = model({ mode: InsertMode.FREE, position: at }, true)
    const app = creator.open(creator.open(creator.root().sections[0]!.items[0] as CategoryItem).sections[0]!.items[0] as never)
    expect(titles(app)).toEqual([
      ['Triggers', ['On new message', 'On reaction']],
      ['MESSAGE', ['SEND_TEXT']],
      ['CHAT', ['LEAVE_CHAT']],
      ['Telegram bot action', ['Send message', 'Edit message']],
    ])
    const send = app.sections[3]!.items[0]!
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
    expect(results.map((item) => item.title)).toEqual(['Edit message', 'On new message', 'Send message', 'SEND_TEXT'])
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

const ACCOUNT_AND_BOT: NodeTypeDescriptor[] = [
  nodeType({
    key: 'telegram.accountTrigger@2',
    name: 'telegram.accountTrigger',
    version: 2,
    displayName: 'Telegram Account Trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    credentials: { types: ['TELEGRAM_ACCOUNT'], required: true },
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGES'), displayName: 'Messages' }, { ...option('POSTS'), displayName: 'Posts & comments' }],
      }),
      property('messageEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['MESSAGES'] }],
        options: [{ ...option('NEW_MESSAGE'), displayName: 'New message' }],
      }),
      property('postEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['POSTS'] }],
        options: [{ ...option('NEW_POST'), displayName: 'New post' }, { ...option('NEW_COMMENT'), displayName: 'New comment' }],
      }),
    ],
  }),
  nodeType({
    key: 'telegram.accountAction@2',
    name: 'telegram.accountAction',
    version: 2,
    displayName: 'Telegram Account',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['TELEGRAM_ACCOUNT'], required: true },
    properties: [
      property('resource', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGE'), displayName: 'Message' }, { ...option('SEARCH'), displayName: 'Search' }],
      }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [option('SEND_TEXT', 'MESSAGE'), option('SEARCH_CHATS', 'SEARCH')],
      }),
    ],
  }),
  nodeType({
    key: 'telegram.botTrigger@2',
    name: 'telegram.botTrigger',
    version: 2,
    displayName: 'Telegram Bot Trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    credentials: { types: ['TELEGRAM_BOT'], required: true },
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        options: [
          { ...option('MESSAGES'), displayName: 'Messages' },
          { ...option('INTERACTIONS'), displayName: 'Interactions' },
          { ...option('PAYMENTS'), displayName: 'Payments' },
        ],
      }),
      property('messageEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['MESSAGES'] }],
        options: [{ ...option('COMMAND'), displayName: 'Command' }],
      }),
      property('interactionEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['INTERACTIONS'] }],
        options: [{ ...option('BUTTON_PRESSED'), displayName: 'Button pressed' }],
      }),
      property('paymentEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['PAYMENTS'] }],
        options: [{ ...option('PRE_CHECKOUT'), displayName: 'Pre-checkout query' }],
      }),
    ],
  }),
  nodeType({
    key: 'telegram.botAction@2',
    name: 'telegram.botAction',
    version: 2,
    displayName: 'Telegram Bot',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['TELEGRAM_BOT'], required: true },
    properties: [
      property('resource', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGE'), displayName: 'Message' }, { ...option('PAYMENT'), displayName: 'Payment' }],
      }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [
          { ...option('SEND_TEXT', 'MESSAGE'), displayName: 'Send a text message' },
          { ...option('SEND_INVOICE', 'PAYMENT'), displayName: 'Send an invoice' },
        ],
      }),
    ],
  }),
]

describe('NodeCreatorModel with an app used as an account and as a bot', () => {
  const creator = new NodeCreatorModel(ACCOUNT_AND_BOT, { fits: () => true, allowTriggers: true, hasTrigger: false })
  const telegram = () => creator.open(creator.root().sections[0]!.items[0] as never)

  it('offers the account and the bot first', () => {
    expect(titles(telegram())).toEqual([['', ['Telegram Account', 'Telegram Bot']]])
    expect(telegram().sections[0]!.items.map((item) => item.kind)).toEqual([CreatorItemKind.VARIANT, CreatorItemKind.VARIANT])
  })

  it('lists the account\'s trigger events by group, then its actions by resource', () => {
    const account = creator.open(telegram().sections[0]!.items[0] as never)
    expect(titles(account)).toEqual([
      ['Triggers · Messages', ['On new message']],
      ['Triggers · Posts & comments', ['On new post', 'On new comment']],
      ['Message', ['SEND_TEXT']],
      ['Search', ['SEARCH_CHATS']],
    ])
    const comment = account.sections[1]!.items[1]!
    expect(comment.kind === CreatorItemKind.NODE && comment.parameters).toEqual({ operation: 'POSTS', postEvents: ['NEW_COMMENT'] })
  })

  it('finds a trigger event by its name', () => {
    expect(creator.search('new comment').map((item) => item.key)).toContain('telegram.accountTrigger@2:POSTS:NEW_COMMENT')
  })

  it('lists the bot\'s trigger events by group, then its actions by resource, preset', () => {
    const bot = creator.open(telegram().sections[0]!.items[1] as never)
    expect(titles(bot)).toEqual([
      ['Triggers · Messages', ['On command']],
      ['Triggers · Interactions', ['On button pressed']],
      ['Triggers · Payments', ['On pre-checkout query']],
      ['Message', ['Send a text message']],
      ['Payment', ['Send an invoice']],
    ])
    const invoice = bot.sections[4]!.items[0]!
    expect(invoice.kind === CreatorItemKind.NODE && invoice.parameters).toEqual({ resource: 'PAYMENT', operation: 'SEND_INVOICE' })
  })
})

const VIBER: NodeTypeDescriptor[] = [
  nodeType({
    key: 'viber.accountAction@1',
    name: 'viber.accountAction',
    displayName: 'Viber Account',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['VIBER_ACCOUNT'], required: true },
    properties: [property('operation', { type: PropertyType.OPTIONS, options: [{ ...option('SEND_TEXT'), displayName: 'Send a text message' }] })],
  }),
  nodeType({
    key: 'viber.botTrigger@1',
    name: 'viber.botTrigger',
    displayName: 'Viber Bot Trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    credentials: { types: ['VIBER_BOT'], required: true },
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        options: [
          { ...option('MESSAGES'), displayName: 'Messages' },
          { ...option('SUBSCRIPTIONS'), displayName: 'Subscriptions' },
          { ...option('DELIVERY'), displayName: 'Delivery' },
        ],
      }),
      property('messageEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['MESSAGES'] }],
        options: [{ ...option('NEW_MESSAGE'), displayName: 'New message' }],
      }),
      property('subscriptionEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['SUBSCRIPTIONS'] }],
        options: [
          { ...option('CONVERSATION_STARTED'), displayName: 'Conversation started' },
          { ...option('SUBSCRIBED'), displayName: 'Subscribed' },
        ],
      }),
      property('deliveryEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['DELIVERY'] }],
        options: [{ ...option('SEEN'), displayName: 'Seen' }],
      }),
    ],
  }),
  nodeType({
    key: 'viber.botAction@1',
    name: 'viber.botAction',
    displayName: 'Viber Bot',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['VIBER_BOT'], required: true },
    properties: [
      property('resource', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGE'), displayName: 'Message' }, { ...option('BROADCAST'), displayName: 'Broadcast' }],
      }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [
          { ...option('SEND_RICH_MEDIA', 'MESSAGE'), displayName: 'Send a rich media carousel' },
          { ...option('BROADCAST_TEXT', 'BROADCAST'), displayName: 'Broadcast a text message' },
        ],
      }),
    ],
  }),
]

describe('NodeCreatorModel with the Viber bot', () => {
  const creator = new NodeCreatorModel(VIBER, { fits: () => true, allowTriggers: true, hasTrigger: false })
  const viber = () => creator.open(creator.root().sections[0]!.items[0] as never)

  it('offers the account and the bot', () => {
    expect(titles(viber())).toEqual([['', ['Viber Account', 'Viber Bot']]])
  })

  it('lists the bot\'s trigger events by group, then its actions by resource, preset', () => {
    const bot = creator.open(viber().sections[0]!.items[1] as never)
    expect(titles(bot)).toEqual([
      ['Triggers · Messages', ['On new message']],
      ['Triggers · Subscriptions', ['On conversation started', 'On subscribed']],
      ['Triggers · Delivery', ['On seen']],
      ['Message', ['Send a rich media carousel']],
      ['Broadcast', ['Broadcast a text message']],
    ])
    const started = bot.sections[1]!.items[0]!
    expect(started.kind === CreatorItemKind.NODE && started.parameters).toEqual({
      operation: 'SUBSCRIPTIONS',
      subscriptionEvents: ['CONVERSATION_STARTED'],
    })
    const broadcast = bot.sections[4]!.items[0]!
    expect(broadcast.kind === CreatorItemKind.NODE && broadcast.parameters).toEqual({ resource: 'BROADCAST', operation: 'BROADCAST_TEXT' })
  })
})

const WHATSAPP: NodeTypeDescriptor[] = [
  nodeType({
    key: 'whatsapp.botTrigger@1',
    name: 'whatsapp.botTrigger',
    displayName: 'WhatsApp Business Trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    credentials: { types: ['WHATSAPP_BOT'], required: true },
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        options: [
          { ...option('MESSAGES'), displayName: 'Messages' },
          { ...option('DELIVERY'), displayName: 'Delivery' },
          { ...option('ACCOUNT'), displayName: 'Templates & account' },
        ],
      }),
      property('messageEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['MESSAGES'] }],
        options: [
          { ...option('NEW_MESSAGE'), displayName: 'New message' },
          { ...option('INTERACTIVE_REPLY'), displayName: 'Button or list reply' },
        ],
      }),
      property('deliveryEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['DELIVERY'] }],
        options: [{ ...option('FAILED'), displayName: 'Failed' }],
      }),
      property('accountEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['ACCOUNT'] }],
        options: [{ ...option('TEMPLATE_STATUS'), displayName: 'Template status' }],
      }),
    ],
  }),
  nodeType({
    key: 'whatsapp.botAction@1',
    name: 'whatsapp.botAction',
    displayName: 'WhatsApp Business',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['WHATSAPP_BOT'], required: true },
    properties: [
      property('resource', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGE'), displayName: 'Message' }, { ...option('TEMPLATE'), displayName: 'Template' }],
      }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [
          { ...option('SEND_REPLY_BUTTONS', 'MESSAGE'), displayName: 'Send reply buttons' },
          { ...option('SEND_TEMPLATE', 'TEMPLATE'), displayName: 'Send a template' },
        ],
      }),
    ],
  }),
]

describe('NodeCreatorModel with the WhatsApp Business number', () => {
  const creator = new NodeCreatorModel(WHATSAPP, { fits: () => true, allowTriggers: true, hasTrigger: false })

  it('lists the number\'s trigger events by group, then its actions by resource, preset', () => {
    const whatsapp = creator.open(creator.root().sections[0]!.items[0] as never)
    expect(titles(whatsapp)).toEqual([
      ['Triggers · Messages', ['On new message', 'On button or list reply']],
      ['Triggers · Delivery', ['On failed']],
      ['Triggers · Templates & account', ['On template status']],
      ['Message', ['Send reply buttons']],
      ['Template', ['Send a template']],
    ])
    const reply = whatsapp.sections[0]!.items[1]!
    expect(reply.kind === CreatorItemKind.NODE && reply.parameters).toEqual({
      operation: 'MESSAGES',
      messageEvents: ['INTERACTIVE_REPLY'],
    })
    const template = whatsapp.sections[4]!.items[0]!
    expect(template.kind === CreatorItemKind.NODE && template.parameters).toEqual({ resource: 'TEMPLATE', operation: 'SEND_TEMPLATE' })
  })
})

const WHATSAPP_ACCOUNT: NodeTypeDescriptor[] = [
  nodeType({
    key: 'whatsapp.accountTrigger@1',
    name: 'whatsapp.accountTrigger',
    displayName: 'WhatsApp Account Trigger',
    group: NodeGroup.COMMUNICATION,
    kind: NodeKind.TRIGGER,
    inputs: [],
    credentials: { types: ['WHATSAPP_ACCOUNT'], required: true },
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        options: [
          { ...option('MESSAGES'), displayName: 'Messages' },
          { ...option('GROUPS'), displayName: 'Groups' },
        ],
      }),
      property('messageEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['MESSAGES'] }],
        options: [
          { ...option('NEW_MESSAGE'), displayName: 'New message' },
          { ...option('REACTION'), displayName: 'Reaction' },
        ],
      }),
      property('groupEvents', {
        type: PropertyType.MULTI_OPTIONS,
        show: [{ field: 'operation', values: ['GROUPS'] }],
        options: [{ ...option('ADDED_TO_GROUP'), displayName: 'Added to a group' }],
      }),
    ],
  }),
  nodeType({
    key: 'whatsapp.accountAction@1',
    name: 'whatsapp.accountAction',
    displayName: 'WhatsApp Account',
    group: NodeGroup.COMMUNICATION,
    credentials: { types: ['WHATSAPP_ACCOUNT'], required: true },
    properties: [
      property('resource', {
        type: PropertyType.OPTIONS,
        options: [{ ...option('MESSAGE'), displayName: 'Message' }, { ...option('GROUP'), displayName: 'Group' }],
      }),
      property('operation', {
        type: PropertyType.OPTIONS,
        optionsFilteredBy: 'resource',
        options: [
          { ...option('SEND_TEXT', 'MESSAGE'), displayName: 'Send a text message' },
          { ...option('ADD_MEMBERS', 'GROUP'), displayName: 'Add members' },
        ],
      }),
    ],
  }),
]

describe('NodeCreatorModel with a linked WhatsApp account', () => {
  const creator = new NodeCreatorModel(WHATSAPP_ACCOUNT, { fits: () => true, allowTriggers: true, hasTrigger: false })

  it('lists the account\'s trigger events by group, then its actions by resource, preset', () => {
    const account = creator.open(creator.root().sections[0]!.items[0] as never)
    expect(titles(account)).toEqual([
      ['Triggers · Messages', ['On new message', 'On reaction']],
      ['Triggers · Groups', ['On added to a group']],
      ['Message', ['Send a text message']],
      ['Group', ['Add members']],
    ])
    const added = account.sections[1]!.items[0]!
    expect(added.kind === CreatorItemKind.NODE && added.parameters).toEqual({
      operation: 'GROUPS',
      groupEvents: ['ADDED_TO_GROUP'],
    })
    const add = account.sections[3]!.items[0]!
    expect(add.kind === CreatorItemKind.NODE && add.parameters).toEqual({ resource: 'GROUP', operation: 'ADD_MEMBERS' })
  })
})
