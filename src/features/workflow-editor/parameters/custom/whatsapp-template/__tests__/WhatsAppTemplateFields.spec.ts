// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive, type Component } from 'vue'
import { WhatsAppBotService } from '@/components/credential/whatsapp-bot/whatsappBot.service'
import type { WhatsAppTemplateStructureResponse } from '@/components/credential/whatsapp-bot/whatsappBot.types'
import { PropertyType, type PropertyDescriptor } from '@/core/node-types/descriptor'
import type { OptionsLoader } from '@/core/node-types/OptionsLoader'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import FixedCollectionField from '../../../fields/FixedCollectionField.vue'
import { provideOptionsContext } from '../../../options/optionsContext'
import { overrideFor } from '../../../overrides'
import TemplateBodyValuesField from '../TemplateBodyValuesField.vue'
import TemplateButtonValuesField from '../TemplateButtonValuesField.vue'
import TemplateHeaderTypeField from '../TemplateHeaderTypeField.vue'
import TemplateHeaderVariableField from '../TemplateHeaderVariableField.vue'
import { clearTemplateStructures } from '../useTemplateStructure'
import { namedLanguage, positionalLanguage } from './templateFixtures'

vi.mock('@/components/credential/whatsapp-bot/whatsappBot.service', () => ({
  WhatsAppBotService: { templateStructure: vi.fn() },
}))

const structure = vi.mocked(WhatsAppBotService.templateStructure)

const BODY = property('bodyValues', { type: PropertyType.FIXED_COLLECTION, children: [property('name'), property('value')] })
const BUTTONS = property('buttonValues', {
  type: PropertyType.FIXED_COLLECTION,
  children: [property('index', { type: PropertyType.NUMBER }), property('type', { type: PropertyType.OPTIONS }), property('value')],
})
const HEADER_TYPE = property('headerType', { type: PropertyType.OPTIONS, expression: false })
const HEADER_VARIABLE = property('headerVariable')

const answer = (languages = [namedLanguage(), positionalLanguage()]): WhatsAppTemplateStructureResponse => ({
  name: 'order_ready',
  languages,
})

/** Mounts a field of a "Send a template" node with the given form values. */
function mountField(
  field: Component,
  fieldProperty: PropertyDescriptor,
  modelValue: unknown,
  parameters: Record<string, unknown>,
  credentialId: number | null = 7,
) {
  const values = reactive({ ...parameters })
  const Host = defineComponent({
    setup() {
      provideOptionsContext({ loader: {} as OptionsLoader, credentialId: () => credentialId, parameters: () => values })
      return () =>
        h(field, { property: fieldProperty, modelValue, path: fieldProperty.name, issues: new Map(), typeKey: 'whatsapp.botAction@1' })
    },
  })
  return mount(Host)
}

const lastEmitted = (host: ReturnType<typeof mountField>, field: Component) =>
  host.findComponent(field).emitted('update:modelValue')?.at(-1)?.[0]

describe('WhatsApp template fields', () => {
  beforeEach(() => {
    clearTemplateStructures()
    structure.mockReset()
    structure.mockResolvedValue(answer())
  })
  afterEach(() => clearTemplateStructures())

  it('are the editors of the template operation\'s header, body and button values', () => {
    expect(overrideFor('whatsapp.botAction@1', 'headerType')).toBe(TemplateHeaderTypeField)
    expect(overrideFor('whatsapp.botAction@1', 'headerVariable')).toBe(TemplateHeaderVariableField)
    expect(overrideFor('whatsapp.botAction@1', 'bodyValues')).toBe(TemplateBodyValuesField)
    expect(overrideFor('whatsapp.botAction@1', 'buttonValues')).toBe(TemplateButtonValuesField)
  })

  it('gives one input per body variable and stores the values by name', async () => {
    const host = mountField(TemplateBodyValuesField, BODY, [{ name: 'order', value: '42' }], {
      template: 'order_ready',
      language: 'en_US',
    })
    await flushPromises()

    expect(structure).toHaveBeenCalledWith(7, 'order_ready')
    expect(host.find('[data-test="template-body"]').text()).toContain('Hi {{name}}, order {{order}} is ready')
    expect(host.findAll('.wa-template-body__name').map((name) => name.text())).toEqual(['{{name}}', '{{order}}'])
    expect(lastEmitted(host, TemplateBodyValuesField)).toEqual([
      { name: 'name', value: '' },
      { name: 'order', value: '42' },
    ])
  })

  it('warns that a template not approved is refused', async () => {
    structure.mockResolvedValue(answer([namedLanguage({ approved: false, status: 'PENDING' })]))
    const host = mountField(TemplateBodyValuesField, BODY, [], { template: 'order_ready', language: 'en_US' })
    await flushPromises()

    expect(host.find('[data-test="not-approved"]').text()).toContain('PENDING')
  })

  it('falls back to the plain list and says why when the template is not known', async () => {
    const dynamic = mountField(TemplateBodyValuesField, BODY, [], { template: '{{ $json.template }}' })
    await flushPromises()
    expect(dynamic.findComponent(FixedCollectionField).exists()).toBe(true)
    expect(dynamic.text()).toContain('chosen by an expression')
    expect(structure).not.toHaveBeenCalled()

    const noLanguage = mountField(TemplateBodyValuesField, BODY, [], { template: 'order_ready', language: 'de' })
    await flushPromises()
    expect(noLanguage.findComponent(FixedCollectionField).exists()).toBe(true)
    expect(noLanguage.text()).toContain('Its languages: en_US, uk')

    structure.mockResolvedValue({ name: 'order_ready', languages: [], error: 'Error validating access token' })
    clearTemplateStructures()
    const failed = mountField(TemplateBodyValuesField, BODY, [], { template: 'order_ready' })
    await flushPromises()
    expect(failed.text()).toContain('Error validating access token')
  })

  it('takes the header kind and its variable name from the template', async () => {
    const parameters = { template: 'order_ready', language: 'en_US' }
    const type = mountField(TemplateHeaderTypeField, HEADER_TYPE, 'NONE', parameters)
    const variable = mountField(TemplateHeaderVariableField, HEADER_VARIABLE, undefined, parameters)
    await flushPromises()

    expect(lastEmitted(type, TemplateHeaderTypeField)).toBe('TEXT')
    expect(type.text()).toContain('Order {{order}}')
    expect(lastEmitted(variable, TemplateHeaderVariableField)).toBe('order')

    const image = mountField(TemplateHeaderTypeField, HEADER_TYPE, 'TEXT', { template: 'order_ready', language: 'uk' })
    await flushPromises()
    expect(lastEmitted(image, TemplateHeaderTypeField)).toBe('IMAGE')
  })

  it('asks only for the buttons that take a value', async () => {
    const host = mountField(TemplateButtonValuesField, BUTTONS, [], { template: 'order_ready', language: 'en_US' })
    await flushPromises()

    const titles = host.findAll('.wa-template-buttons__title').map((title) => title.text())
    expect(titles).toEqual(['Button 1 · Thanks', 'Button 2 · Track *'])
    expect(host.text()).toContain('https://shop.example/t/{{1}}')
    expect(lastEmitted(host, TemplateButtonValuesField)).toEqual([{ index: 1, type: 'URL', value: '' }])
  })
})
