// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { PropertyType } from '@/core/node-types/descriptor'
import type { OptionsLoader } from '@/core/node-types/OptionsLoader'
import { option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { provideOptionsContext } from '../../../options/optionsContext'
import { resolveField } from '../../../fieldRegistry'
import KeyboardField from '../KeyboardField.vue'

const show = (type: string) => [{ field: 'type', values: [type] }]

const KEYBOARD = property('keyboard', {
  type: PropertyType.COLLECTION,
  expression: false,
  children: [
    property('type', {
      type: PropertyType.OPTIONS,
      expression: false,
      defaultValue: 'NONE',
      options: ['NONE', 'INLINE', 'REPLY', 'REMOVE', 'FORCE_REPLY', 'JSON'].map((value) => option(value)),
    }),
    property('inlineButtons', {
      type: PropertyType.FIXED_COLLECTION,
      expression: false,
      show: show('INLINE'),
      children: [
        property('text'),
        property('action', { type: PropertyType.OPTIONS, expression: false, defaultValue: 'CALLBACK', options: [option('CALLBACK'), option('URL'), option('PAY')] }),
        property('value'),
        property('newRow', { type: PropertyType.BOOLEAN, expression: false, defaultValue: false }),
      ],
    }),
    property('replyButtons', { type: PropertyType.FIXED_COLLECTION, expression: false, show: show('REPLY'), children: [property('text')] }),
    property('placeholder', { displayName: 'Input placeholder', show: show('REPLY') }),
    property('json', { displayName: 'reply_markup', show: show('JSON') }),
  ],
})

/** Mounts the field inside a node whose operation is given, as the node details view provides it. */
function mountField(modelValue: Record<string, unknown> | undefined, operation = 'SEND_TEXT') {
  const Host = defineComponent({
    setup() {
      provideOptionsContext({
        loader: {} as OptionsLoader,
        credentialId: () => null,
        parameters: () => ({ operation }),
      })
      return () =>
        h(KeyboardField, {
          property: KEYBOARD,
          modelValue,
          path: 'keyboard',
          issues: new Map([['keyboard.inlineButtons[1].value', 'URL is required']]),
          typeKey: 'telegram.botAction@2',
        })
    },
  })
  const host = mount(Host)
  return { host, field: host.findComponent(KeyboardField) }
}

const emitted = (field: ReturnType<typeof mountField>['field']) => field.emitted('update:modelValue')!.at(-1)![0]

const TWO_ROWS = {
  type: 'INLINE',
  inlineButtons: [
    { text: 'Buy', action: 'CALLBACK', value: 'buy' },
    { text: 'Site', action: 'URL', newRow: true },
  ],
}

describe('Telegram keyboard field', () => {
  it('edits the keyboard of the bot node only', () => {
    expect(resolveField('telegram.botAction@2', KEYBOARD)).toBe(KeyboardField)
    expect(resolveField('telegram.accountAction@2', KEYBOARD)).not.toBe(KeyboardField)
  })

  it('previews inline buttons in their rows and flags the one with an issue', () => {
    const { host } = mountField(TWO_ROWS)
    const rows = host.findAll('.wf-kb-preview__row')
    expect(rows.map((row) => row.findAll('.wf-kb-preview__button').map((b) => b.text()))).toEqual([['Buy'], ['Site']])
    expect(rows[1]!.find('.wf-kb-preview__button').classes()).toContain('is-invalid')
  })

  it('edits the picked button with the value labelled by its action', async () => {
    const { host } = mountField(TWO_ROWS)
    await host.findAll('.wf-kb-preview__button')[1]!.trigger('click')
    const labels = host.findAll('.wf-kb-editor .wf-param__label > span:first-child').map((l) => l.text())
    expect(labels).toEqual(['Text', 'Action', 'URL'])
    expect(host.find('.wf-kb-editor').text()).toContain('URL is required')
  })

  it('adds a button to a row and keeps the flat list with row starts', async () => {
    const { host, field } = mountField(TWO_ROWS)
    await host.findAll('.wf-kb-preview__add')[0]!.trigger('click')
    expect(emitted(field)).toEqual({
      type: 'INLINE',
      inlineButtons: [
        { text: 'Buy', action: 'CALLBACK', value: 'buy' },
        { text: 'Button 3', action: 'CALLBACK' },
        { text: 'Site', action: 'URL', newRow: true },
      ],
    })
  })

  it('moves the picked button to the row above and drops the emptied row', async () => {
    const { host, field } = mountField(TWO_ROWS)
    await host.findAll('.wf-kb-preview__button')[1]!.trigger('click')
    await host.find('[aria-label="Move to the row above"]').trigger('click')
    expect(emitted(field)).toEqual({
      type: 'INLINE',
      inlineButtons: [
        { text: 'Buy', action: 'CALLBACK', value: 'buy' },
        { text: 'Site', action: 'URL' },
      ],
    })
  })

  it('removes the last button together with the list', async () => {
    const { host, field } = mountField({ type: 'INLINE', inlineButtons: [{ text: 'Only' }] })
    await host.find('.wf-kb-preview__button').trigger('click')
    await host.find('[aria-label="Remove the button"]').trigger('click')
    expect(emitted(field)).toEqual({ type: 'INLINE' })
  })

  it('shows the settings of the type after the builder', () => {
    const { host } = mountField({ type: 'REPLY', replyButtons: [{ text: 'Yes' }] })
    expect(host.find('.wf-kb-preview--reply').exists()).toBe(true)
    expect(host.text()).toContain('Input placeholder')
    expect(host.text()).not.toContain('reply_markup')
  })

  it('warns when an edit operation has a keyboard Telegram does not take there', () => {
    expect(mountField({ type: 'REPLY' }, 'EDIT_TEXT').host.text()).toContain('takes only inline buttons')
    expect(mountField({ type: 'INLINE' }, 'EDIT_TEXT').host.text()).not.toContain('takes only inline buttons')
  })
})
