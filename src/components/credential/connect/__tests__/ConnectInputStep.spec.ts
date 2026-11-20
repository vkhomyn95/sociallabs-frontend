// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ConnectInput, ConnectPin } from '@/stores/credential/types'
import ConnectInputStep from '../ConnectInputStep.vue'

describe('ConnectInputStep', () => {
  it('names a 2FA password as such', () => {
    const step = mount(ConnectInputStep, { props: { input: ConnectInput.PASSWORD, message: 'Enter the password' } })

    expect(step.text()).toContain('Two-step verification password')
    expect(step.find('input[data-test="connect-input"]').attributes('type')).toBe('password')
  })

  it('asks for the XChat PIN as a hidden number', () => {
    const step = mount(ConnectInputStep, {
      props: { input: ConnectInput.PASSWORD, message: 'Enter the PIN', pin: ConnectPin.UNLOCK },
    })
    const field = step.find('input[data-test="connect-input"]')

    expect(step.text()).toContain('XChat PIN')
    expect(step.text()).not.toContain('Two-step')
    expect(field.attributes('type')).toBe('password')
    expect(field.attributes('inputmode')).toBe('numeric')
  })

  it('reminds to keep a new PIN and sends what was typed', async () => {
    const step = mount(ConnectInputStep, {
      props: { input: ConnectInput.PASSWORD, message: 'Choose a PIN', pin: ConnectPin.SET_UP },
    })

    expect(step.text()).toContain('New XChat PIN')
    expect(step.text()).toContain('the X app asks for it on every new device')
    await step.find('input[data-test="connect-input"]').setValue(' 4821 ')
    await step.find('form').trigger('submit')

    expect(step.emitted('submit')).toEqual([[ConnectInput.PASSWORD, '4821']])
  })
})
