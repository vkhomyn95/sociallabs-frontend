// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { PropertyOption } from '@/core/node-types/descriptor'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import { OptionsLoader, type OptionsQuery } from '@/core/node-types/OptionsLoader'
import { provideOptionsContext } from '../parameters/options/optionsContext'
import ParameterForm from '../parameters/ParameterForm.vue'

const MODEL = property('model', { displayName: 'Model', required: true, expression: false, loadOptions: true })

function mountWith(fetch: (query: OptionsQuery) => Promise<PropertyOption[]>) {
  const credentialId = ref<number | null>(7)
  const Host = defineComponent({
    setup() {
      provideOptionsContext({ loader: new OptionsLoader(fetch), credentialId: () => credentialId.value, parameters: () => ({ model: 'm-1' }) })
      return () => h(ParameterForm, { properties: [MODEL], values: { model: 'm-1' }, typeKey: 'ai.model.openai@1' })
    },
  })
  return { wrapper: mount(Host), credentialId }
}

describe('LoadedOptionsField', () => {
  it('loads the choices with the node credential and again when it changes', async () => {
    const fetch = vi.fn(() => Promise.resolve([{ value: 'm-1', displayName: 'Model one', description: '', group: '' }]))
    const { wrapper, credentialId } = mountWith(fetch)
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith({ typeKey: 'ai.model.openai@1', property: 'model', credentialId: 7, parameters: { model: 'm-1' } })
    expect(wrapper.text()).toContain('Model one')

    credentialId.value = 8
    await flushPromises()
    expect(fetch).toHaveBeenLastCalledWith(expect.objectContaining({ credentialId: 8 }))
  })

  it('explains a failure and asks for nothing without a credential', async () => {
    const fetch = vi.fn(() => Promise.reject(new Error('The openai API refused the key (401)')))
    const { wrapper, credentialId } = mountWith(fetch)
    await flushPromises()
    expect(wrapper.text()).toContain('refused the key')

    credentialId.value = null
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Select a credential to load the list')
  })

  it('takes a typed id in By ID mode', async () => {
    const { wrapper } = mountWith(() => Promise.resolve([]))
    await flushPromises()

    await wrapper.findAll('.wf-choice-bar__mode button')[1]!.trigger('click')
    await wrapper.find('.wf-loaded input').setValue('my-model')

    expect(wrapper.findComponent(ParameterForm).emitted('update:values')!.at(-1)).toEqual([{ model: 'my-model' }])
  })
})
