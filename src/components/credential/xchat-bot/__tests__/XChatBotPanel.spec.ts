// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import XChatBotPanel from '../XChatBotPanel.vue'
import { XChatBotService } from '../xchatBot.service'
import { XChatBotStatus, type XChatBotStatusResponse } from '../xchatBot.types'

vi.mock('../xchatBot.service', () => ({ XChatBotService: { status: vi.fn() } }))

const credential: Credential = {
  id: 7,
  name: '@shop_bot',
  type: CredentialType.XCHAT_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.X,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-17T10:00:00',
}

const RUNNING: XChatBotStatusResponse = {
  status: XChatBotStatus.READY,
  statusChangedAt: '2026-11-17T10:00:00Z',
  counters: { received: 1500, handled: 1490, pending: 0, duplicates: 3, dropped: 0, ignored: 6, undecryptable: 1 },
  publicAddress: true,
  webhookUrl: 'https://srv.example/api/v1/public/xchat/bots/h1',
  callbackUrl: 'https://srv.example/api/v1/public/xchat/oauth/callback',
  appBearer: true,
  account: { userId: '1700', username: 'shop_bot', keyVersion: '5', keysRegistered: true },
}

const status = vi.mocked(XChatBotService.status)

async function mountPanel(answer: XChatBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(XChatBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('XChatBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('is the panel of XChat bot credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.XCHAT_BOT]).toBe(XChatBotPanel)
  })

  it('shows a receiving bot with its account, key, counters and the addresses its app needs', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(7, expect.any(AbortSignal))
    expect(text).toContain('Receiving')
    expect(text).toContain('@shop_bot')
    expect(text).toContain('XChat key 5')
    expect(text).toContain('Not decrypted')
    expect(text).toContain('1,500')
    expect(text).toContain('/xchat/oauth/callback')
    expect(text).toContain('/xchat/bots/h1')
    expect(text).toContain('Pay-per-use')
    expect(text).not.toContain('No Bearer token')
  })

  it('calls out a bot that cannot receive: no Bearer token, no public address, a key X no longer lists', async () => {
    const refused: XChatBotStatusResponse = {
      status: XChatBotStatus.NO_APP_BEARER,
      statusMessage: 'Registering the webhook needs the X app’s Bearer token',
      publicAddress: false,
      appBearer: false,
      account: { ...RUNNING.account!, keysRegistered: false },
    }
    const text = (await mountPanel(refused)).text()
    expect(text).toContain('No Bearer token')
    expect(text).toContain('No public address')
    expect(text).toContain('XChat key not registered')
    expect(text).not.toContain('Callback URL')
  })
})
