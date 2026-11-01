// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { PropertyType, type PropertyOption } from '@/core/node-types/descriptor'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import { OptionsLoader } from '@/core/node-types/OptionsLoader'
import { provideOptionsContext } from '../parameters/options/optionsContext'
import ParameterForm from '../parameters/ParameterForm.vue'
import { entriesOf, listValue, withEntries } from '../parameters/fields/stringList'

const IDS = property('chatIds', { displayName: 'Chat IDs', type: PropertyType.STRING_LIST, expression: false })

function mountForm(values: Record<string, unknown>, field = IDS) {
  return mount(ParameterForm, { props: { properties: [field], values, typeKey: 'telegram.accountTrigger@2' } })
}

const lastValues = (wrapper: ReturnType<typeof mount>) => wrapper.emitted('update:values')!.at(-1)

describe('string lists', () => {
  it('split typed or pasted text and never repeat an entry', () => {
    expect(entriesOf(' -100, 42\n\n7 ')).toEqual(['-100', '42', '7'])
    expect(withEntries(['42'], ['42', '7'])).toEqual(['42', '7'])
    expect(listValue([])).toBeUndefined()
  })
})

describe('StringListField', () => {
  it('adds a tag on Enter and removes the last one on Backspace', async () => {
    const wrapper = mountForm({ chatIds: ['-100'] })
    const input = wrapper.find('.wf-tags__input')

    await input.setValue('42')
    await input.trigger('keydown', { key: 'Enter' })
    expect(lastValues(wrapper)).toEqual([{ chatIds: ['-100', '42'] }])

    await wrapper.setProps({ values: { chatIds: ['-100', '42'] } })
    await input.setValue('')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(lastValues(wrapper)).toEqual([{ chatIds: ['-100'] }])
  })
})

describe('LoadedListField', () => {
  it('offers the loaded chats with their kind and keeps ids not in the list', async () => {
    const chats: PropertyOption[] = [{ value: '-100', displayName: 'Ads', description: 'Supergroup', group: '' }]
    const fetch = vi.fn(() => Promise.resolve(chats))
    const loaded = property('chatIds', { ...IDS, loadOptions: true })
    const Host = defineComponent({
      setup() {
        const credentialId = ref<number | null>(7)
        provideOptionsContext({ loader: new OptionsLoader(fetch), credentialId: () => credentialId.value, parameters: () => ({}) })
        return () => h(ParameterForm, { properties: [loaded], values: { chatIds: ['555'] }, typeKey: 'telegram.accountTrigger@2' })
      },
    })
    const wrapper = mount(Host)
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(expect.objectContaining({ property: 'chatIds', credentialId: 7 }))
    expect(wrapper.text()).toContain('555')

    await wrapper.find('.slb-select__trigger').trigger('click')
    expect(wrapper.text()).toContain('Ads')
    expect(wrapper.text()).toContain('Supergroup')
    expect(wrapper.text()).toContain('Not in the list')
  })
})

describe('OptionsField', () => {
  it('lists options under their group headings with descriptions', async () => {
    const kinds = property('kind', {
      type: PropertyType.OPTIONS,
      expression: false,
      options: [
        { value: 'NEW_MESSAGE', displayName: 'New message', description: '', group: 'Messages' },
        { value: 'NEW_POST', displayName: 'New post', description: 'A new post in a channel', group: 'Posts' },
      ],
    })
    const wrapper = mountForm({}, kinds)

    await wrapper.find('.slb-select__trigger').trigger('click')

    expect(wrapper.findAll('.slb-select__group-heading').map((heading) => heading.text())).toEqual(['Messages', 'Posts'])
    expect(wrapper.find('.slb-select__option-description').text()).toBe('A new post in a channel')
  })
})
