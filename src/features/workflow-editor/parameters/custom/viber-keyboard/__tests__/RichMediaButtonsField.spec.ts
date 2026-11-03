// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import { PropertyType } from '@/core/node-types/descriptor'
import type { OptionsLoader } from '@/core/node-types/OptionsLoader'
import { option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { provideOptionsContext } from '../../../options/optionsContext'
import RichMediaButtonsField from '../RichMediaButtonsField.vue'

const RICH_BUTTONS = property('richButtons', {
  type: PropertyType.FIXED_COLLECTION,
  expression: false,
  children: [
    property('text'),
    property('action', {
      type: PropertyType.OPTIONS,
      expression: false,
      defaultValue: 'REPLY',
      options: ['REPLY', 'OPEN_URL', 'LOCATION_PICKER', 'SHARE_PHONE', 'NONE'].map((value) => option(value)),
    }),
  ],
})

const PRODUCTS = [
  { text: 'Phone', columns: 6, rows: 2 },
  { text: 'Buy', columns: 6, rows: 1 },
  { text: 'Laptop', columns: 6, rows: 2 },
  { text: 'Buy', columns: 6, rows: 1 },
]

/** Mounts the field inside a node with the given rich media size, as the node details view provides it. */
function mountField(modelValue: unknown[] | undefined, parameters: Record<string, unknown>) {
  const values = reactive({ ...parameters })
  const Host = defineComponent({
    setup() {
      provideOptionsContext({ loader: {} as OptionsLoader, credentialId: () => null, parameters: () => values })
      return () =>
        h(RichMediaButtonsField, { property: RICH_BUTTONS, modelValue, path: 'richButtons', issues: new Map(), typeKey: 'viber.botAction@1' })
    },
  })
  return { host: mount(Host), values }
}

const cardTexts = (host: ReturnType<typeof mountField>['host']) =>
  host.findAll('.wf-viber-rich__card').map((card) => card.findAll('.wf-viber-cell').map((cell) => cell.text()))

describe('Rich media buttons field', () => {
  it('splits buttons into cards of the size the node sets and follows changes of it', async () => {
    const { host, values } = mountField(PRODUCTS, { richColumns: 6, richRows: 3 })
    expect(cardTexts(host)).toEqual([['Phone', 'Buy'], ['Laptop', 'Buy']])
    expect(host.text()).toContain('2 cards')

    values.richRows = 7
    await host.vm.$nextTick()
    expect(cardTexts(host)).toEqual([['Phone', 'Buy', 'Laptop', 'Buy']])
  })

  it('takes the default card of 6 × 7 when the node sets none or an expression', () => {
    const card = (parameters: Record<string, unknown>) =>
      mountField([{ text: 'Open' }], parameters).host.find('.wf-viber-rich__card').attributes('style')
    expect(card({})).toContain('repeat(6, 1fr)')
    expect(card({})).toContain('repeat(7, 26px)')
    expect(card({ richColumns: 3, richRows: '{{ $json.rows }}' })).toContain('repeat(3, 1fr)')
  })

  it('adds the first button to an empty carousel', async () => {
    const { host } = mountField(undefined, {})
    await host.find('.wf-viber-add').trigger('click')
    expect(host.findComponent(RichMediaButtonsField).emitted('update:modelValue')!.at(-1)![0]).toEqual([{ text: 'Button 1', action: 'REPLY' }])
  })
})
