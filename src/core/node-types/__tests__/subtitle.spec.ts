import { describe, expect, it } from 'vitest'
import { NodeKind, PropertyType } from '../descriptor'
import { subtitleOf } from '../subtitle'
import { nodeType, property } from './descriptorFixtures'

const node = (type: string, parameters: Record<string, unknown> = {}) => ({ type, parameters })

describe('subtitleOf', () => {
  const action = nodeType({
    name: 'telegram.botAction',
    displayName: 'Telegram bot',
    properties: [
      property('operation', {
        type: PropertyType.OPTIONS,
        defaultValue: 'SEND_MESSAGE',
        options: [
          { value: 'SEND_MESSAGE', displayName: 'Send message', description: '', group: '' },
          { value: 'EDIT_MESSAGE', displayName: 'Edit message', description: '', group: '' },
        ],
      }),
    ],
  })

  it('names the selected operation, the default one until it is changed', () => {
    expect(subtitleOf(action, node(action.name))).toBe('Send message')
    expect(subtitleOf(action, node(action.name, { operation: 'EDIT_MESSAGE' }))).toBe('Edit message')
  })

  it('lists the events of a trigger and counts the rest', () => {
    const trigger = nodeType({
      kind: NodeKind.TRIGGER,
      properties: [
        property('events', {
          type: PropertyType.MULTI_OPTIONS,
          options: ['New message', 'Edited', 'Reaction'].map((displayName, i) => ({ value: `E${i}`, displayName, description: '', group: '' })),
        }),
      ],
    })
    expect(subtitleOf(trigger, node(trigger.name, { events: ['E0'] }))).toBe('On New message')
    expect(subtitleOf(trigger, node(trigger.name, { events: ['E0', 'E1', 'E2'] }))).toBe('On New message, Edited +1')
  })

  it('shows method and URL of an HTTP request, as written', () => {
    const http = nodeType({
      name: 'http.request',
      properties: [property('method', { type: PropertyType.OPTIONS, defaultValue: 'GET', options: [{ value: 'GET', displayName: 'GET', description: '', group: '' }] }), property('url')],
    })
    expect(subtitleOf(http, node(http.name, { url: '{{ $json.link }}' }))).toBe('GET: {{ $json.link }}')
  })

  it('falls back to the type name, and says when the type is unknown', () => {
    expect(subtitleOf(nodeType({ displayName: 'Merge' }), node('test.node'))).toBe('Merge')
    expect(subtitleOf(undefined, node('gone.node'))).toBe('gone.node (unknown type)')
  })
})
