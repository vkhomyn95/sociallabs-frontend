// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import {
  CredentialKind,
  CredentialPlatform,
  CredentialService,
  CredentialType,
  ConnectEventType,
  SetupMode,
  type ConnectEvent,
  type CredentialTypeDescriptor,
} from '@/stores/credential'
import { ConnectView } from '../connect.types'
import { useAccountConnect } from '../useAccountConnect'

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

function connectFlow() {
  let flow!: ReturnType<typeof useAccountConnect>
  mount(defineComponent({
    setup() {
      flow = useAccountConnect(XCHAT, () => undefined)
      return () => h('div')
    },
  }))
  return flow
}

describe('useAccountConnect, OAuth', () => {
  it('shows the authorize step with the callback URL the status named, then the result', async () => {
    let send!: (event: ConnectEvent) => void
    vi.spyOn(CredentialService, 'startConnect').mockResolvedValue('s1')
    vi.spyOn(CredentialService, 'subscribeConnect').mockImplementation((_id, onEvent) => {
      send = onEvent
      return () => undefined
    })
    const flow = connectFlow()

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
