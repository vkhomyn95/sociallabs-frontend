import { describe, expect, it } from 'vitest'
import { PropertyType } from '../descriptor'
import { defaultParameters, IssueKind, isVisible, schemaPath, validateParameters } from '../parameters'
import { option, property } from './descriptorFixtures'

const filterChats = property('filterChats', { type: PropertyType.BOOLEAN, expression: false })
const chatIds = property('chatIds', { required: true, show: [{ field: 'filterChats', values: ['true'] }] })
const mode = property('mode', { type: PropertyType.OPTIONS, options: [option('A'), option('B')], defaultValue: 'A' })
const onlyB = property('onlyB', { hide: [{ field: 'mode', values: ['A'] }] })
const fields = [filterChats, chatIds, mode, onlyB]

describe('isVisible', () => {
  it('follows show and hide conditions of siblings, using their defaults when unset', () => {
    expect(isVisible(chatIds, {}, fields)).toBe(false)
    expect(isVisible(chatIds, { filterChats: true }, fields)).toBe(true)
    expect(isVisible(onlyB, {}, fields), 'mode defaults to A').toBe(false)
    expect(isVisible(onlyB, { mode: 'B' }, fields)).toBe(true)
  })

  it('a list matches when any element does', () => {
    const events = property('events', { type: PropertyType.MULTI_OPTIONS })
    const reaction = property('emoji', { show: [{ field: 'events', values: ['REACTION'] }] })
    expect(isVisible(reaction, { events: ['NEW_MESSAGE', 'REACTION'] }, [events, reaction])).toBe(true)
    expect(isVisible(reaction, { events: ['NEW_MESSAGE'] }, [events, reaction])).toBe(false)
  })
})

describe('defaultParameters', () => {
  it('copies declared defaults and leaves collections empty', () => {
    const list = property('events', { type: PropertyType.MULTI_OPTIONS, defaultValue: ['NEW_MESSAGE'] })
    const nested = property('options', { type: PropertyType.COLLECTION, children: [property('timeout', { type: PropertyType.NUMBER, defaultValue: 30 })] })
    const values = defaultParameters([list, nested, chatIds])
    // Options start empty; an option gets its default when it is added.
    expect(values).toEqual({ events: ['NEW_MESSAGE'] })
    expect(values.events).not.toBe(list.defaultValue)
  })
})

describe('validateParameters', () => {
  it('reports required visible fields only', () => {
    expect(validateParameters(fields, {})).toEqual([])
    expect(validateParameters(fields, { filterChats: true })).toEqual([
      { path: 'chatIds', kind: IssueKind.REQUIRED, message: 'ChatIds is required' },
    ])
  })

  it('checks numbers and options but not expressions', () => {
    const count = property('count', { type: PropertyType.NUMBER })
    expect(validateParameters([count, mode], { count: 'x', mode: 'C' }).map((i) => i.kind)).toEqual([
      IssueKind.NOT_A_NUMBER,
      IssueKind.UNKNOWN_OPTION,
    ])
    expect(validateParameters([count, mode], { count: '{{ $json.n }}', mode: '{{ $json.mode }}' })).toEqual([])
  })

  it('reports nested fields of collection elements with their path', () => {
    const rules = property('rules', { type: PropertyType.FIXED_COLLECTION, children: [property('value', { required: true })] })
    expect(validateParameters([rules], { rules: [{ value: 'a' }, {}] }).map((i) => i.path)).toEqual(['rules[1].value'])
  })
})

describe('schemaPath', () => {
  it('drops element indexes, keeping the nesting', () => {
    expect(schemaPath('model')).toBe('model')
    expect(schemaPath('options.voice')).toBe('options.voice')
    expect(schemaPath('speakers[3].voice')).toBe('speakers.voice')
  })
})
