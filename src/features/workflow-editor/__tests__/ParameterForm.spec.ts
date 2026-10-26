// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { ExpressionCompletions } from '@/core/expression/completions'
import { PropertyType } from '@/core/node-types/descriptor'
import { option, property } from '@/core/node-types/__tests__/descriptorFixtures'
import { provideExpressionContext } from '../expression/expressionContext'
import ExpressionInput from '../expression/ExpressionInput.vue'
import ParameterForm from '../parameters/ParameterForm.vue'

const PROPERTIES = [
  property('events', { type: PropertyType.MULTI_OPTIONS, options: [option('NEW_MESSAGE'), option('REACTION')], defaultValue: ['NEW_MESSAGE'], expression: false }),
  property('filterChats', { displayName: 'Only selected chats', type: PropertyType.BOOLEAN, expression: false }),
  property('chatIds', { displayName: 'Chat IDs', required: true, show: [{ field: 'filterChats', values: ['true'] }] }),
  property('limit', { type: PropertyType.NUMBER, description: 'Items per run' }),
  property('path', { expression: false, placeholder: 'orders' }),
]

const mountForm = (values: Record<string, unknown> = {}, issues = new Map<string, string>()) =>
  mount(ParameterForm, { props: { properties: PROPERTIES, values, typeKey: 'test.node@1', issues } })

const labels = (wrapper: ReturnType<typeof mountForm>) => wrapper.findAll('.wf-param__label > span:first-child').map((l) => l.text())

describe('ParameterForm', () => {
  it('renders the visible fields of the descriptor', () => {
    expect(labels(mountForm())).toMatchInlineSnapshot(`
      [
        "Events",
        "Only selected chats",
        "Limit",
        "Path",
      ]
    `)
    expect(labels(mountForm({ filterChats: true }))).toContain('Chat IDs *')
  })

  it('emits the whole new record and drops cleared values', async () => {
    const wrapper = mountForm({ path: 'a', limit: 3 })
    await wrapper.find('input[placeholder="orders"]').setValue('')
    expect(wrapper.emitted('update:values')![0]).toEqual([{ limit: 3 }])
  })

  it('switches a number field to an expression and keeps the value as a template', async () => {
    const wrapper = mountForm({ limit: 5 })
    const limit = wrapper.findAll('.wf-param')[2]!
    await limit.findAll('.wf-param__mode button')[1]!.trigger('click')
    expect(wrapper.emitted('update:values')![0]).toEqual([{ limit: '{{ 5 }}' }])

    await wrapper.setProps({ values: { limit: '{{ $json.n }}' } })
    expect(wrapper.findAll('.wf-param')[2]!.find('textarea').element.value).toBe('{{ $json.n }}')
  })

  it('takes a field dropped from the input panel as an expression', async () => {
    const wrapper = mountForm()
    const limit = wrapper.findAll('.wf-param')[2]!
    await limit.trigger('drop', { dataTransfer: { getData: () => '{{ $json.count }}', types: ['text/plain'] } })
    expect(wrapper.emitted('update:values')![0]).toEqual([{ limit: '{{ $json.count }}' }])
  })

  it('shows validation issues next to their field', () => {
    const wrapper = mountForm({ filterChats: true }, new Map([['chatIds', 'Chat IDs is required']]))
    expect(wrapper.text()).toContain('Chat IDs is required')
  })
})

describe('ExpressionInput', () => {
  const Host = defineComponent({
    setup() {
      provideExpressionContext({
        completions: () => new ExpressionCompletions({ json: { message: { text: 'hi' } }, nodes: new Map() }),
        preview: async () => ({ value: 'hi', error: null }),
        hasData: () => true,
      })
      const value = ref('')
      return () => h(ExpressionInput, { modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) })
    },
  })

  it('closes braces as they are typed and completes fields of the sample item', async () => {
    const wrapper = mount(Host, { attachTo: document.body })
    const textarea = wrapper.find('textarea')
    const el = textarea.element as HTMLTextAreaElement

    el.value = '{{'
    el.setSelectionRange(2, 2)
    await textarea.trigger('input', { data: '{' })
    expect(el.value).toBe('{{  }}')
    expect(el.selectionStart).toBe(3)

    el.value = '{{ $json.me }}'
    el.setSelectionRange(11, 11)
    await textarea.trigger('input', { data: 'e' })
    expect(wrapper.findAll('[role="option"]').map((o) => o.find('.wf-completions__label').text())).toEqual(['message'])

    await textarea.trigger('keydown', { key: 'Enter' })
    expect(el.value).toBe('{{ $json.message }}')
    wrapper.unmount()
  })
})
