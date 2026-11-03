import { describe, expect, it } from 'vitest'
import { PropertyType } from '@/core/node-types/descriptor'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import { INLINE_BUTTONS, REPLY_BUTTONS } from '../buttonKinds'
import { InlineAction, KeyboardType, ReplyRequest } from '../keyboard.types'
import { keyboardTypesFor } from '../keyboardTypes'

const DECLARED = [
  property('text'),
  property('action', { type: PropertyType.OPTIONS, expression: false }),
  property('value', { description: 'Callback data, URL, inline query or text to copy' }),
  property('newRow', { type: PropertyType.BOOLEAN, expression: false }),
]

const names = (properties: { name: string }[]) => properties.map((p) => p.name)

describe('button kinds', () => {
  it('labels the value of an inline button by its action and leaves the row flag to the grid', () => {
    const url = INLINE_BUTTONS.fields(DECLARED, { text: 'Site', action: InlineAction.URL })
    expect(names(url)).toEqual(['text', 'action', 'value'])
    expect(url[2]!.displayName).toBe('URL')
    expect(INLINE_BUTTONS.fields(DECLARED, { text: 'Go' })[2]!.displayName).toBe('Callback data')
  })

  it('offers no value for a pay button', () => {
    expect(names(INLINE_BUTTONS.fields(DECLARED, { text: 'Pay', action: InlineAction.PAY }))).toEqual(['text', 'action'])
  })

  it('shows what a button does as an icon', () => {
    expect(INLINE_BUTTONS.icon({ action: InlineAction.CALLBACK })).toBeNull()
    expect(INLINE_BUTTONS.icon({ action: InlineAction.URL })).toBe('action_external')
    expect(REPLY_BUTTONS.icon({ request: ReplyRequest.CONTACT })).toBe('object_phone')
  })

  it('starts new buttons with a numbered text', () => {
    expect(INLINE_BUTTONS.newButton(3)).toEqual({ text: 'Button 3', action: InlineAction.CALLBACK })
    expect(REPLY_BUTTONS.newButton(1)).toEqual({ text: 'Button 1', request: ReplyRequest.TEXT })
  })
})

describe('keyboardTypesFor', () => {
  it('offers only inline keyboards to operations that edit a message or send an invoice', () => {
    expect([...keyboardTypesFor({ operation: 'EDIT_TEXT' })]).toEqual([KeyboardType.NONE, KeyboardType.INLINE, KeyboardType.JSON])
    expect(keyboardTypesFor({ operation: 'SEND_INVOICE' }).has(KeyboardType.REPLY)).toBe(false)
  })

  it('offers every keyboard otherwise', () => {
    expect(keyboardTypesFor({ operation: 'SEND_TEXT' }).size).toBe(Object.keys(KeyboardType).length)
    expect(keyboardTypesFor(undefined).has(KeyboardType.REPLY)).toBe(true)
  })
})
