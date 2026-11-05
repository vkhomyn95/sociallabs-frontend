// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, reactive, type Component } from 'vue'
import { PropertyType } from '@/core/node-types/descriptor'
import type { OptionsLoader } from '@/core/node-types/OptionsLoader'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import { provideOptionsContext } from '../../../options/optionsContext'
import ParameterForm from '../../../ParameterForm.vue'
import { overrideFor } from '../../../overrides'
import ListSectionsField from '../ListSectionsField.vue'
import ReplyButtonsField from '../ReplyButtonsField.vue'

const BUTTONS = property('buttons', {
  type: PropertyType.FIXED_COLLECTION,
  children: [property('id'), property('title')],
})

const SECTIONS = property('sections', {
  type: PropertyType.FIXED_COLLECTION,
  children: [
    property('title'),
    property('rows', { type: PropertyType.FIXED_COLLECTION, children: [property('id'), property('title'), property('description')] }),
  ],
})

/** Mounts a field inside a node with the given parameters, as the node details view provides them. */
function mountField(field: Component, fieldProperty: typeof BUTTONS, modelValue: unknown[] | undefined, parameters: Record<string, unknown>) {
  const values = reactive({ ...parameters })
  const Host = defineComponent({
    setup() {
      provideOptionsContext({ loader: {} as OptionsLoader, credentialId: () => null, parameters: () => values })
      return () =>
        h(field, { property: fieldProperty, modelValue, path: fieldProperty.name, issues: new Map(), typeKey: 'whatsapp.botAction@1' })
    },
  })
  return mount(Host)
}

const editedFields = (host: ReturnType<typeof mountField>) =>
  (host.findComponent(ParameterForm).props('properties') as readonly { name: string }[]).map((field) => field.name)

const emitted = (host: ReturnType<typeof mountField>, field: Component) =>
  host.findComponent(field).emitted('update:modelValue')!.at(-1)![0]

describe('WhatsApp interactive fields', () => {
  it('are the editors of the bot action\'s buttons and sections', () => {
    expect(overrideFor('whatsapp.botAction@1', 'buttons')).toBe(ReplyButtonsField)
    expect(overrideFor('whatsapp.botAction@1', 'sections')).toBe(ListSectionsField)
  })

  it('shows reply buttons under the node\'s text and stops adding at three', async () => {
    const host = mountField(ReplyButtonsField, BUTTONS, [{ id: 'yes', title: 'Yes' }, { id: 'no', title: 'No' }], {
      body: 'Confirm the order?',
      footer: 'Shop',
    })
    expect(host.text()).toContain('Confirm the order?')
    expect(host.findAll('.wf-wa-buttons__button').map((button) => button.text())).toEqual(['Yes', 'No'])
    expect(host.text()).toContain('2 of 3 buttons')

    await host.find('.wf-wa-buttons__add').trigger('click')
    expect(emitted(host, ReplyButtonsField)).toEqual([
      { id: 'yes', title: 'Yes' },
      { id: 'no', title: 'No' },
      { id: 'option_3', title: 'Option 3' },
    ])

    const full = mountField(ReplyButtonsField, BUTTONS, [{ title: 'A' }, { title: 'B' }, { title: 'C' }], {})
    expect(full.find('.wf-wa-buttons__add').exists()).toBe(false)
  })

  it('flags a button title longer than WhatsApp shows', () => {
    const host = mountField(ReplyButtonsField, BUTTONS, [{ id: 'a', title: 'A title far too long for it' }], {})
    expect(host.find('.wf-wa-buttons__button').classes()).toContain('is-invalid')
    expect(host.text()).toContain('27/20')
  })

  it('shows the list with its sections and rows, and adds a row to a section', async () => {
    const host = mountField(ListSectionsField, SECTIONS, [{ title: 'Pizza', rows: [{ id: 'p1', title: 'Margherita', description: 'Tomato' }] }], {
      text: 'Pick one',
      buttonText: 'Menu',
    })
    expect(host.text()).toContain('Menu')
    expect(host.text()).toContain('Pizza')
    expect(host.text()).toContain('Margherita')
    expect(host.text()).toContain('1 of 10 rows')

    const addRow = host.findAll('.wf-wa-list__add').find((button) => button.text() === 'Add row')!
    await addRow.trigger('click')
    expect(emitted(host, ListSectionsField)).toEqual([
      { title: 'Pizza', rows: [{ id: 'p1', title: 'Margherita', description: 'Tomato' }, { id: 'row_2', title: 'Row 2' }] },
    ])
  })

  it('edits a picked row with the row fields and a section with its title only', async () => {
    const host = mountField(ListSectionsField, SECTIONS, [{ title: 'Pizza', rows: [{ id: 'p1', title: 'Margherita' }] }], {})
    await host.find('.wf-wa-list__row').trigger('click')
    expect(host.text()).toContain('Selected row')
    expect(editedFields(host)).toEqual(['id', 'title', 'description'])

    await host.find('.wf-wa-list__section-title').trigger('click')
    expect(host.text()).toContain('Selected section')
    expect(editedFields(host)).toEqual(['title'])
  })

  it('calls for section titles when there are several sections', () => {
    const host = mountField(ListSectionsField, SECTIONS, [{ rows: [{ id: 'a', title: 'A' }] }, { title: 'B', rows: [{ id: 'b', title: 'B' }] }], {})
    expect(host.text()).toContain('Section title needed')
    expect(host.find('.wf-wa-list__section-title').classes()).toContain('is-invalid')
  })
})
