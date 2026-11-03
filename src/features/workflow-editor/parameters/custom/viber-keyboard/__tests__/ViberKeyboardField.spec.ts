// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { PropertyType } from '@/core/node-types/descriptor'
import { option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { resolveField } from '../../../fieldRegistry'
import RichMediaButtonsField from '../RichMediaButtonsField.vue'
import ViberKeyboardField from '../ViberKeyboardField.vue'

const show = (type: string) => [{ field: 'type', values: [type] }]

const BUTTON_FIELDS = [
  property('text'),
  property('action', {
    type: PropertyType.OPTIONS,
    expression: false,
    defaultValue: 'REPLY',
    options: ['REPLY', 'OPEN_URL', 'LOCATION_PICKER', 'SHARE_PHONE', 'NONE'].map((value) => option(value)),
  }),
  property('value'),
  property('columns', { type: PropertyType.NUMBER, expression: false, defaultValue: 6 }),
]

const KEYBOARD = property('keyboard', {
  type: PropertyType.COLLECTION,
  expression: false,
  children: [
    property('type', { type: PropertyType.OPTIONS, expression: false, defaultValue: 'NONE', options: ['NONE', 'BUTTONS', 'JSON'].map((value) => option(value)) }),
    property('buttons', { type: PropertyType.FIXED_COLLECTION, expression: false, show: show('BUTTONS'), children: BUTTON_FIELDS }),
    property('inputField', { displayName: 'Input field', show: show('BUTTONS') }),
    property('background', { displayName: 'Background color', show: show('BUTTONS') }),
    property('json', { displayName: 'keyboard JSON', show: show('JSON') }),
  ],
})

function mountField(modelValue: Record<string, unknown> | undefined) {
  return mount(ViberKeyboardField, {
    props: {
      property: KEYBOARD,
      modelValue,
      path: 'keyboard',
      issues: new Map([['keyboard.buttons[1].value', 'URL is required']]),
      typeKey: 'viber.botAction@1',
    },
  })
}

const emitted = (field: ReturnType<typeof mountField>) => field.emitted('update:modelValue')!.at(-1)![0]

const HALVES = {
  type: 'BUTTONS',
  background: '#2db9b9',
  buttons: [
    { text: '<b>Buy</b>', action: 'REPLY', columns: 3 },
    { text: 'Site', action: 'OPEN_URL', columns: 3, background: '#ff0000' },
    { text: 'Help' },
  ],
}

describe('Viber keyboard field', () => {
  it('edits the keyboard and rich media buttons of the Viber bot node only', () => {
    expect(resolveField('viber.botAction@1', KEYBOARD)).toBe(ViberKeyboardField)
    expect(resolveField('telegram.botAction@2', KEYBOARD)).not.toBe(ViberKeyboardField)
    expect(resolveField('viber.botAction@1', property('richButtons'))).toBe(RichMediaButtonsField)
  })

  it('previews buttons on the six-column grid with their width, colors and plain text', () => {
    const field = mountField(HALVES)
    const cells = field.findAll('.wf-viber-cell')
    expect(cells.map((cell) => cell.text())).toEqual(['Buy', 'Site', 'Help'])
    expect(cells.map((cell) => cell.attributes('style'))).toEqual([
      expect.stringContaining('span 3'),
      expect.stringContaining('span 3'),
      expect.stringContaining('span 6'),
    ])
    expect(cells[1]!.attributes('style')).toContain('background')
    expect(cells[1]!.classes()).toContain('is-invalid')
    expect(field.find('.wf-viber-keyboard').attributes('style')).toContain('background')
  })

  it('edits the picked button with the value labelled by its action', async () => {
    const field = mountField(HALVES)
    await field.findAll('.wf-viber-cell')[1]!.trigger('click')
    const labels = field.findAll('.wf-kb-editor .wf-param__label > span:first-child').map((l) => l.text())
    expect(labels).toEqual(['Text', 'Action', 'URL', 'Columns'])
    expect(field.find('.wf-kb-editor').text()).toContain('URL is required')
  })

  it('adds a button last and moves the picked one to the row above', async () => {
    const field = mountField(HALVES)
    await field.find('.wf-viber-add').trigger('click')
    expect((emitted(field) as typeof HALVES).buttons.at(-1)).toEqual({ text: 'Button 4', action: 'REPLY' })

    await field.setProps({ modelValue: HALVES })
    await field.findAll('.wf-viber-cell')[2]!.trigger('click')
    await field.find('[aria-label="Move to the row above"]').trigger('click')
    expect((emitted(field) as typeof HALVES).buttons.map((button) => button.text)).toEqual(['Help', '<b>Buy</b>', 'Site'])
  })

  it('removes the last button together with the list', async () => {
    const field = mountField({ type: 'BUTTONS', buttons: [{ text: 'Only' }] })
    await field.find('.wf-viber-cell').trigger('click')
    await field.find('[aria-label="Remove the button"]').trigger('click')
    expect(emitted(field)).toEqual({ type: 'BUTTONS' })
  })

  it('shows the keyboard settings of the type after the builder, and no builder for JSON', () => {
    expect(mountField(HALVES).text()).toContain('Input field')
    const json = mountField({ type: 'JSON' })
    expect(json.find('.wf-viber-keyboard').exists()).toBe(false)
    expect(json.text()).toContain('keyboard JSON')
  })
})
