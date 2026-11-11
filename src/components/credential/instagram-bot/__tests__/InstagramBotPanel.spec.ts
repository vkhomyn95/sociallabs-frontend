// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import InstagramBotPanel from '../InstagramBotPanel.vue'
import { InstagramBotService } from '../instagramBot.service'
import { InstagramBotStatus, type InstagramBotStatusResponse } from '../instagramBot.types'
import { tokenExpiresSoon } from '../instagramBot.ui'

vi.mock('../instagramBot.service', () => ({ InstagramBotService: { status: vi.fn() } }))

const credential: Credential = {
  id: 12,
  name: '@shop',
  type: CredentialType.INSTAGRAM_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.INSTAGRAM,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-11T10:00:00',
}

const HOOK = 'https://srv.example/api/v1/public/instagram/bots/h1'

const RUNNING: InstagramBotStatusResponse = {
  status: InstagramBotStatus.READY,
  statusChangedAt: '2026-11-11T10:00:00Z',
  counters: { received: 1500, handled: 1490, pending: 0, duplicates: 3, dropped: 0, foreign: 2 },
  contacts: { seen: 40, inWindow: 6 },
  publicAddress: true,
  appSecret: true,
  webhookUrl: HOOK,
  verifyToken: 'verify-1',
  webhookVerified: true,
  token: { expiresAt: '2099-01-10T00:00:00Z', renewedAt: '2026-11-11T04:00:00Z' },
  account: { userId: '178', username: 'shop', name: 'The Shop', accountType: 'BUSINESS' },
  subscription: { subscribed: true, fields: ['messages', 'comments'] },
}

const status = vi.mocked(InstagramBotService.status)

async function mountPanel(answer: InstagramBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(InstagramBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('InstagramBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('is the panel of Instagram bot credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.INSTAGRAM_BOT]).toBe(InstagramBotPanel)
    expect(CREDENTIAL_PANELS[CredentialType.INSTAGRAM_ACCOUNT]).toBeNull()
  })

  it('shows a receiving account with its users, token, counters and subscription', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(12, expect.any(AbortSignal))
    expect(text).toContain('Receiving')
    expect(text).toContain('@shop · The Shop')
    expect(text).toContain('BUSINESS')
    expect(text).toContain('6 in the 24 h window of 40')
    expect(text).toContain('Token until')
    expect(text).toContain('1,500')
    expect(text).toContain('Other accounts')
    expect(text).toContain('/instagram/bots/h1')
    expect(text).toContain('verified by Meta')
    expect(text).toContain('comments')
    expect(text).not.toContain('Set the webhook in your Meta app')
  })

  it('walks through the App Dashboard until Meta has checked the address', async () => {
    const text = (
      await mountPanel({
        ...RUNNING,
        status: InstagramBotStatus.CLOSED,
        counters: null,
        webhookVerified: false,
        token: {},
      })
    ).text()
    expect(text).toContain('Idle')
    expect(text).toContain('not verified yet')
    expect(text).toContain('Verify token')
    expect(text).toContain('Set the webhook in your Meta app')
    expect(text).toContain('Switch the app to Live')
    expect(text).toContain('Token expiry known after its first renewal')
  })

  it('calls out a missing public address, app secret and an Instagram refusal', async () => {
    const text = (
      await mountPanel({
        ...RUNNING,
        status: InstagramBotStatus.TOKEN_INVALID,
        statusMessage: 'Instagram refuses the token',
        publicAddress: false,
        appSecret: false,
        webhookUrl: null,
        account: null,
        subscription: null,
        accountError: 'Error validating access token',
      })
    ).text()
    expect(text).toContain('Token invalid')
    expect(text).toContain('Instagram refuses the token')
    expect(text).toContain('No public address')
    expect(text).toContain('No app secret')
    expect(text).toContain('Error validating access token')
    expect(text).not.toContain('Callback URL')
  })

  it('tells a token that expires within a week', () => {
    const now = Date.parse('2026-11-11T00:00:00Z')
    expect(tokenExpiresSoon('2026-11-15T00:00:00Z', now)).toBe(true)
    expect(tokenExpiresSoon('2026-12-15T00:00:00Z', now)).toBe(false)
    expect(tokenExpiresSoon(null, now)).toBe(false)
  })
})
