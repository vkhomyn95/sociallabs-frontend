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

/** The first app (or its variant) under "Action in an app" of a workflow that has a trigger. */
const actionsView = (types: NodeTypeDescriptor[], variant?: number): CreatorView => {
  const creator = new NodeCreatorModel(types, { fits: () => true, allowTriggers: true, hasTrigger: true })
  const apps = creator.open(creator.root().sections[0]!.items[0] as CategoryItem)
  const app = creator.open(apps.sections[0]!.items[0] as never)
  return variant === undefined ? app : creator.open(app.sections[0]!.items[variant] as never)
}

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

  it('opens an app under "Action in an app" with only its actions, by resource, preset', () => {
    const creator = model({ mode: InsertMode.FREE, position: at }, true)
    const apps = creator.open(creator.root().sections[0]!.items[0] as CategoryItem)
    expect(apps.sections[0]!.items.map((item) => item.description)).toEqual(['4 actions'])
    const app = creator.open(apps.sections[0]!.items[0] as never)
    expect(app.subtitle).toBe('4 actions')
    expect(titles(app)).toEqual([
      ['MESSAGE', ['SEND_TEXT']],
      ['CHAT', ['LEAVE_CHAT']],
      ['Telegram bot action', ['Send message', 'Edit message']],
    ])
    const send = app.sections[2]!.items[0]!
    expect(send.kind === CreatorItemKind.NODE && send.parameters).toEqual({ operation: 'Send message' })
  })

  it('opens an app under the triggers with only its trigger events', () => {
    const creator = model({ mode: InsertMode.FREE, position: at })
    const apps = creator.root().sections[1]!
    expect(apps.items.map((item) => item.description)).toEqual(['2 triggers'])
    const app = creator.open(apps.items[0] as never)
    expect(app.subtitle).toBe('2 triggers')
    expect(titles(app)).toEqual([['Triggers', ['On new message', 'On reaction']]])
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

  it('offers the account and the bot first, each with its own count', () => {
    expect(creator.root().sections[0]!.items[0]!.description).toBe('Account and Bot · 6 triggers')
    expect(titles(telegram())).toEqual([['', ['Telegram Account', 'Telegram Bot']]])
    expect(telegram().sections[0]!.items.map((item) => item.kind)).toEqual([CreatorItemKind.VARIANT, CreatorItemKind.VARIANT])
    expect(telegram().sections[0]!.items.map((item) => item.description)).toEqual(['3 triggers', '3 triggers'])
    expect(actionsView(ACCOUNT_AND_BOT).sections[0]!.items.map((item) => item.description)).toEqual(['2 actions', '2 actions'])
  })

  it('lists the account\'s trigger events by group', () => {
    const account = creator.open(telegram().sections[0]!.items[0] as never)
    expect(titles(account)).toEqual([
      ['Messages', ['On new message']],
      ['Posts & comments', ['On new post', 'On new comment']],
    ])
    const comment = account.sections[1]!.items[1]!
    expect(comment.kind === CreatorItemKind.NODE && comment.parameters).toEqual({ operation: 'POSTS', postEvents: ['NEW_COMMENT'] })
  })

  it('finds a trigger event by its name', () => {
    expect(creator.search('new comment').map((item) => item.key)).toContain('telegram.accountTrigger@2:POSTS:NEW_COMMENT')
  })

  it('lists the account\'s actions by resource', () => {
    expect(titles(actionsView(ACCOUNT_AND_BOT, 0))).toEqual([
      ['Message', ['SEND_TEXT']],
      ['Search', ['SEARCH_CHATS']],
    ])
  })

  it('lists the bot\'s trigger events by group, and its actions by resource, preset', () => {
    const bot = creator.open(telegram().sections[0]!.items[1] as never)
    expect(titles(bot)).toEqual([
      ['Messages', ['On command']],
      ['Interactions', ['On button pressed']],
      ['Payments', ['On pre-checkout query']],
    ])
    const actions = actionsView(ACCOUNT_AND_BOT, 1)
    expect(titles(actions)).toEqual([
      ['Message', ['Send a text message']],
      ['Payment', ['Send an invoice']],
    ])
    const invoice = actions.sections[1]!.items[0]!
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

  it('offers the account and the bot among the actions; only the bot has triggers', () => {
    expect(titles(actionsView(VIBER))).toEqual([['', ['Viber Account', 'Viber Bot']]])
    expect(viber().title).toBe('Viber')
    expect(viber().subtitle).toBe('4 triggers')
  })

  it('lists the bot\'s trigger events by group, and its actions by resource, preset', () => {
    const bot = viber()
    expect(titles(bot)).toEqual([
      ['Messages', ['On new message']],
      ['Subscriptions', ['On conversation started', 'On subscribed']],
      ['Delivery', ['On seen']],
    ])
    const actions = actionsView(VIBER, 1)
    expect(titles(actions)).toEqual([
      ['Message', ['Send a rich media carousel']],
      ['Broadcast', ['Broadcast a text message']],
    ])
    const started = bot.sections[1]!.items[0]!
    expect(started.kind === CreatorItemKind.NODE && started.parameters).toEqual({
      operation: 'SUBSCRIPTIONS',
      subscriptionEvents: ['CONVERSATION_STARTED'],
    })
    const broadcast = actions.sections[1]!.items[0]!
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

  it('lists the number\'s trigger events by group, and its actions by resource, preset', () => {
    const whatsapp = creator.open(creator.root().sections[0]!.items[0] as never)
    expect(titles(whatsapp)).toEqual([
      ['Messages', ['On new message', 'On button or list reply']],
      ['Delivery', ['On failed']],
      ['Templates & account', ['On template status']],
    ])
    const actions = actionsView(WHATSAPP)
    expect(titles(actions)).toEqual([
      ['Message', ['Send reply buttons']],
      ['Template', ['Send a template']],
    ])
    const reply = whatsapp.sections[0]!.items[1]!
    expect(reply.kind === CreatorItemKind.NODE && reply.parameters).toEqual({
      operation: 'MESSAGES',
      messageEvents: ['INTERACTIVE_REPLY'],
    })
    const template = actions.sections[1]!.items[0]!
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

  it('lists the account\'s trigger events by group, and its actions by resource, preset', () => {
    const account = creator.open(creator.root().sections[0]!.items[0] as never)
    expect(titles(account)).toEqual([
      ['Messages', ['On new message', 'On reaction']],
      ['Groups', ['On added to a group']],
    ])
    const actions = actionsView(WHATSAPP_ACCOUNT)
    expect(titles(actions)).toEqual([
      ['Message', ['Send a text message']],
      ['Group', ['Add members']],
    ])
    const added = account.sections[1]!.items[0]!
    expect(added.kind === CreatorItemKind.NODE && added.parameters).toEqual({
      operation: 'GROUPS',
      groupEvents: ['ADDED_TO_GROUP'],
    })
    const add = actions.sections[1]!.items[0]!
    expect(add.kind === CreatorItemKind.NODE && add.parameters).toEqual({ resource: 'GROUP', operation: 'ADD_MEMBERS' })
  })
})

describe('NodeCreatorModel with the Instagram account and bot', () => {
  const instagram = (name: string, kind: NodeKind, credential: string): NodeTypeDescriptor =>
    nodeType({
      key: `instagram.${name}@1`,
      name: `instagram.${name}`,
      displayName: name,
      group: NodeGroup.COMMUNICATION,
      kind,
      ...(kind === NodeKind.TRIGGER ? { inputs: [] } : {}),
      credentials: { types: [credential], required: true },
      properties: [property('operation', { type: PropertyType.OPTIONS, options: [option('ONE'), option('TWO')] })],
    })
  const TYPES = [
    instagram('accountTrigger', NodeKind.TRIGGER, 'INSTAGRAM_ACCOUNT'),
    instagram('accountAction', NodeKind.ACTION, 'INSTAGRAM_ACCOUNT'),
    instagram('botTrigger', NodeKind.TRIGGER, 'INSTAGRAM_BOT'),
    instagram('botAction', NodeKind.ACTION, 'INSTAGRAM_BOT'),
  ]

  it('splits into the account and the bot, among the triggers and among the actions', () => {
    const creator = new NodeCreatorModel(TYPES, { fits: () => true, allowTriggers: true, hasTrigger: false })
    const triggers = creator.open(creator.root().sections[0]!.items[0] as never)
    expect(titles(triggers)).toEqual([['', ['Instagram Account', 'Instagram Bot']]])
    expect(titles(actionsView(TYPES))).toEqual([['', ['Instagram Account', 'Instagram Bot']]])
  })
})
