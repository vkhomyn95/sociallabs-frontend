// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  ConnectEventType,
  CredentialKind,
  CredentialPlatform,
  CredentialService,
  CredentialType,
  SetupMode,
  type ConnectEvent,
  type CredentialTypeDescriptor,
} from '@/stores/credential'
import { ConnectView } from '../connect.types'
import { useAccountConnect } from '../useAccountConnect'

vi.mock('@/stores/credential/service', () => ({
  CredentialService: { startConnect: vi.fn(), subscribeConnect: vi.fn(), cancelConnect: vi.fn() },
}))

const WHATSAPP: CredentialTypeDescriptor = {
  type: CredentialType.WHATSAPP_ACCOUNT,
  kind: CredentialKind.ACCOUNT,
  platform: CredentialPlatform.WHATSAPP,
  displayName: 'WhatsApp account',
  description: '',
  setupMode: SetupMode.INTERACTIVE,
  available: true,
  testable: true,
  fields: [],
}

const XCHAT: CredentialTypeDescriptor = {
  type: CredentialType.XCHAT_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.X,
  displayName: 'XChat bot',
  description: '',
  setupMode: SetupMode.INTERACTIVE,
  available: true,
  testable: true,
  fields: [],
}

function connectFlow(descriptor: CredentialTypeDescriptor) {
  let flow!: ReturnType<typeof useAccountConnect>
  mount(defineComponent({
    setup() {
      flow = useAccountConnect(descriptor, () => undefined)
      return () => h('div')
    },
  }))
  return flow
}

/** @returns how to push events into the session the flow starts */
function connectEvents(): (event: ConnectEvent) => void {
  let emit: (event: ConnectEvent) => void = () => undefined
  vi.mocked(CredentialService.startConnect).mockResolvedValue('session-1')
  vi.mocked(CredentialService.subscribeConnect).mockImplementation((_, onEvent) => {
    emit = onEvent
    return () => undefined
  })
  return (event) => emit(event)
}

describe('useAccountConnect', () => {
  it('shows a pairing code with where to enter it, and the QR code again when one comes', async () => {
    const emit = connectEvents()
    const flow = connectFlow(WHATSAPP)

    await flow.start('', { method: 'PAIRING_CODE', phoneNumber: '+380501234567' })
    await flushPromises()
    emit({ type: ConnectEventType.PAIRING_CODE, message: 'Enter the code', payload: { code: 'ABCDEFGH' } })
    const pairing = flow.state.value
    emit({ type: ConnectEventType.STATUS, message: 'Still waiting', payload: {} })

    expect(pairing.view).toBe(ConnectView.PAIRING_CODE)
    expect(pairing.view === ConnectView.PAIRING_CODE && pairing.code).toBe('ABCDEFGH')
    expect(pairing.view === ConnectView.PAIRING_CODE && pairing.instructions.join(' ')).toContain('phone number instead')
    expect(flow.state.value.view).toBe(ConnectView.PAIRING_CODE)
  })
})

describe('useAccountConnect, OAuth', () => {
  it('shows the authorize step with the callback URL the status named, then the result', async () => {
    const send = connectEvents()
    const flow = connectFlow(XCHAT)

    await flow.start('', { clientId: 'c', clientSecret: 's' })
    send({ type: ConnectEventType.STATUS, message: 'Callback URL to add in your X app: https://srv/cb', payload: {} })
    send({ type: ConnectEventType.OPEN_URL, message: 'Sign in to X', payload: { url: 'https://x.com/i/oauth2/authorize?a=1' } })
    await flushPromises()

    expect(flow.state.value).toEqual({
      view: ConnectView.AUTHORIZE,
      url: 'https://x.com/i/oauth2/authorize?a=1',
      message: 'Sign in to X',
      note: 'Callback URL to add in your X app: https://srv/cb',
    })

    send({ type: ConnectEventType.STATUS, message: 'still waiting', payload: {} })
    expect(flow.state.value.view).toBe(ConnectView.AUTHORIZE)

    send({ type: ConnectEventType.ERROR, message: 'X did not authorize the bot (access_denied)', payload: {} })
    expect(flow.state.value).toEqual({ view: ConnectView.ERROR, message: 'X did not authorize the bot (access_denied)' })
  })
})
