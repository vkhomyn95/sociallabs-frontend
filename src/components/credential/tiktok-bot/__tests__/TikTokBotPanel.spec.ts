// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import TikTokBotPanel from '../TikTokBotPanel.vue'
import { TikTokBotService } from '../tiktokBot.service'
import { TikTokBotCapability, TikTokBotStatus, type TikTokBotStatusResponse } from '../tiktokBot.types'

vi.mock('../tiktokBot.service', () => ({
  TikTokBotService: { status: vi.fn(), allowReplacingForeignCallback: vi.fn() },
}))

const credential: Credential = {
  id: 7,
  name: '@shop_ua',
  type: CredentialType.TIKTOK_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.TIKTOK,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-21T10:00:00',
}

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

const RUNNING: TikTokBotStatusResponse = {
  status: TikTokBotStatus.READY,
  statusChangedAt: '2026-11-21T10:00:00Z',
  counters: { bots: 1, received: 1500, handled: 1490, pending: 0, duplicates: 3, foreign: 2, dropped: 0, ignored: 5 },
  publicAddress: true,
  callbackUrl: 'https://srv.example/api/v1/public/tiktok/oauth/callback/',
  webhookUrl: 'https://srv.example/api/v1/public/tiktok/apps/h1',
  webhookTypes: ['COMMENT', 'DIRECT_MESSAGE'],
  replaceForeignCallback: false,
  media: { prefix: 'https://srv.example/api/v1/public/tiktok/media/h1/', verified: true },
  reauthorizeBy: inDays(300),
  account: {
    openId: 'open-1',
    username: 'shop_ua',
    messagingAccount: true,
    capabilities: [TikTokBotCapability.MESSAGING, TikTokBotCapability.COMMENTS],
    missing: { [TikTokBotCapability.PUBLISHING]: ['video.publish'] },
  },
  contacts: [
    { username: 'buyer', conversationId: 'c-1', isFollower: true, lastInboundAt: '2026-11-22T09:00:00Z', windowOpen: true, sentSince: 2 },
  ],
}

const status = vi.mocked(TikTokBotService.status)
const allow = vi.mocked(TikTokBotService.allowReplacingForeignCallback)

async function mountPanel(answer: TikTokBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(TikTokBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('TikTokBotPanel', () => {
  beforeEach(() => {
    status.mockReset()
    allow.mockReset()
  })

  it('is the panel of TikTok bot credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.TIKTOK_BOT]).toBe(TikTokBotPanel)
  })

  it('shows a receiving bot with its account, capabilities, counters, addresses, media and contacts', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(7, expect.any(AbortSignal))
    expect(text).toContain('Receiving')
    expect(text).toContain('@shop_ua')
    expect(text).toContain('Direct messages')
    expect(text).toContain('needs video.publish')
    expect(text).toContain('1,500')
    expect(text).toContain('Other accounts')
    expect(text).toContain('/tiktok/oauth/callback/')
    expect(text).toContain('/tiktok/apps/h1')
    expect(text).toContain('Comments')
    expect(text).toContain('Verified by TikTok')
    expect(text).toContain('@buyer')
    expect(text).toContain('Window open')
    expect(text).toContain('2 sent since')
    expect(text).not.toContain('No public address')
  })

  it('calls out what keeps a bot from receiving and an authorization that ends soon', async () => {
    const text = (
      await mountPanel({
        ...RUNNING,
        status: TikTokBotStatus.WEBHOOK_FOREIGN,
        counters: null,
        publicAddress: false,
        callbackUrl: null,
        media: null,
        reauthorizeBy: inDays(5),
        account: null,
        accountError: 'Authorize the account again',
        contacts: [],
      })
    ).text()
    expect(text).toContain('Webhook used elsewhere')
    expect(text).toContain('The app’s webhook goes elsewhere')
    expect(text).toContain('No public address')
    expect(text).toContain('Authorize the account again')
    expect(text).toContain('days left')
    expect(text).toContain('first post published from a file')
    expect(text).toContain('Nobody yet')
    expect(text).not.toContain('Redirect URL')
  })

  it('saves the consent to replace a foreign webhook and loads the status again', async () => {
    allow.mockResolvedValue()
    const wrapper = await mountPanel({ ...RUNNING, status: TikTokBotStatus.WEBHOOK_FOREIGN })
    await wrapper.find('.slb-tiktok-setup input[type="checkbox"]').setValue(true)
    await flushPromises()
    expect(allow).toHaveBeenCalledWith(7, true)
    expect(status).toHaveBeenCalledTimes(2)
  })
})
