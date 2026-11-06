// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { CredentialPlatform } from '@/stores/credential/types'
import ConnectPairingCodeStep from '../ConnectPairingCodeStep.vue'
import { PAIRING_CODE_INSTRUCTIONS } from '../connect-instructions'

describe('ConnectPairingCodeStep', () => {
  it('shows an eight-character code as two groups with where to enter it', () => {
    const step = mount(ConnectPairingCodeStep, {
      props: {
        code: 'ABCDEFGH',
        message: 'Enter the code on the phone',
        instructions: PAIRING_CODE_INSTRUCTIONS[CredentialPlatform.WHATSAPP]!,
      },
    })

    expect(step.find('[data-test="pairing-code"]').text()).toBe('ABCD-EFGH')
    expect(step.text()).toContain('Link with phone number instead')
  })

  it('keeps a code of another shape as it came', () => {
    const step = mount(ConnectPairingCodeStep, { props: { code: '123-456', message: '', instructions: [] } })

    expect(step.find('[data-test="pairing-code"]').text()).toBe('123-456')
  })
})
