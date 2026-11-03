import { describe, expect, it } from 'vitest'
import { PropertyType } from '@/core/node-types/descriptor'
import { option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { KEYBOARD_BUTTONS, richMediaButtons } from '../viberButtonKinds'
import { ViberButtonAction } from '../viberKeyboard.types'

const DECLARED = [
  property('text'),
  property('action', {
    type: PropertyType.OPTIONS,
    expression: false,
    defaultValue: 'REPLY',
    options: ['REPLY', 'OPEN_URL', 'LOCATION_PICKER', 'SHARE_PHONE', 'NONE'].map((value) => option(value)),
  }),
  property('value'),
  property('columns', { type: PropertyType.NUMBER }),
  property('rows', { type: PropertyType.NUMBER }),
]

const names = (fields: { name: string }[]) => fields.map((field) => field.name)

describe('Viber button kinds', () => {
  it('labels the value by the action and drops it for actions without one', () => {
    const url = KEYBOARD_BUTTONS.fields(DECLARED, { action: 'OPEN_URL' })
    expect(url.find((field) => field.name === 'value')?.displayName).toBe('URL')
    expect(names(KEYBOARD_BUTTONS.fields(DECLARED, { action: 'SHARE_PHONE' }))).not.toContain('value')
    expect(KEYBOARD_BUTTONS.icon({ action: 'SHARE_PHONE' })).toBe('object_phone')
  })

  it('offers rich media only the actions Viber takes there, keeping a chosen one so it reads', () => {
    const actions = (action: ViberButtonAction) =>
      richMediaButtons(6, 7)
        .fields(DECLARED, { action })
        .find((field) => field.name === 'action')!
        .options.map((choice) => choice.value)
    expect(actions(ViberButtonAction.REPLY)).toEqual(['REPLY', 'OPEN_URL', 'NONE'])
    expect(actions(ViberButtonAction.SHARE_PHONE)).toEqual(['REPLY', 'OPEN_URL', 'SHARE_PHONE', 'NONE'])
  })

  it('hints the size a button may take on a card', () => {
    const rows = richMediaButtons(4, 3).fields(DECLARED, {}).find((field) => field.name === 'rows')
    expect(rows?.description).toBe('1 to 3, the height of a card')
  })
})
