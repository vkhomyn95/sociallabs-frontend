// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import WhatsAppBotPanel from '../WhatsAppBotPanel.vue'
import { WhatsAppBotService } from '../whatsappBot.service'
import { WhatsAppBotStatus, type WhatsAppBotStatusResponse } from '../whatsappBot.types'

vi.mock('../whatsappBot.service', () => ({ WhatsAppBotService: { status: vi.fn() } }))

const credential: Credential = {
  id: 11,
  name: 'Shop number',
  type: CredentialType.WHATSAPP_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.WHATSAPP,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-05T10:00:00',
}

const HOOK = 'https://srv.example/api/v1/public/whatsapp/bots/h1'

const RUNNING: WhatsAppBotStatusResponse = {
  status: WhatsAppBotStatus.READY,
  statusChangedAt: '2026-11-05T10:00:00Z',
  counters: { received: 1200, handled: 1190, pending: 1, duplicates: 2, dropped: 0, foreign: 7 },
  contacts: { seen: 30, inWindow: 4 },
  publicAddress: true,
  appSecret: true,
  webhookUrl: HOOK,
  verifyToken: 'verify-1',
  number: {
    displayPhoneNumber: '+1 555-010-0000',
    verifiedName: 'Shop',
    qualityRating: 'GREEN',
    messagingLimitTier: 'TIER_1K',
    status: 'CONNECTED',
  },
  webhook: { effective: HOOK, here: true, phoneNumber: HOOK, application: 'https://app.example/hook' },
}

const status = vi.mocked(WhatsAppBotService.status)

async function mountPanel(answer: WhatsAppBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(WhatsAppBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('WhatsAppBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('is the panel of WhatsApp Business credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.WHATSAPP_BOT]).toBe(WhatsAppBotPanel)
  })

  it('shows a receiving number with its quality, users, counters and webhook', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(11, expect.any(AbortSignal))
    expect(text).toContain('Receiving')
    expect(text).toContain('Shop · +1 555-010-0000')
    expect(text).toContain('Quality GREEN')
    expect(text).toContain('TIER_1K')
    expect(text).toContain('4 in the 24 h window of 30')
    expect(text).toContain('1,200')
    expect(text).toContain('Other numbers')
    expect(text).toContain('/whatsapp/bots/h1')
    expect(text).toContain('here')
    expect(text).toContain('Paid messages')
    expect(text).not.toContain('Verify token')
    expect(text).not.toContain('another address')
  })

  it('shows the verify token when the address must be set by hand', async () => {
    const text = (await mountPanel({ ...RUNNING, status: WhatsAppBotStatus.WEBHOOK_UNVERIFIED })).text()
    expect(text).toContain('Set the webhook')
    expect(text).toContain('Verify token')
    expect(text).toContain('verify-1')
  })

  it('calls out an address set elsewhere, no public address and no app secret', async () => {
    const idle: WhatsAppBotStatusResponse = {
      status: WhatsAppBotStatus.CLOSED,
      contacts: { seen: 0, inWindow: 0 },
      publicAddress: false,
      appSecret: false,
      number: RUNNING.number,
      webhook: { effective: 'https://old.example/hook', here: false, application: 'https://old.example/hook' },
    }
    const text = (await mountPanel(idle)).text()
    expect(text).toContain('Idle')
    expect(text).toContain('No public address')
    expect(text).toContain('No app secret')
    expect(text).toContain('another address')
    expect(text).not.toContain('Received')
  })

  it('reports a Meta that did not answer as a warning, not an error of the panel', async () => {
    const text = (
      await mountPanel({
        status: WhatsAppBotStatus.CLOSED,
        contacts: { seen: 3, inWindow: 1 },
        publicAddress: true,
        appSecret: true,
        accountError: 'Error validating access token',
      })
    ).text()
    expect(text).toContain('Meta did not answer')
    expect(text).toContain('Error validating access token')
    expect(text).toContain('1 in the 24 h window of 3')
  })

  it('reloads on refresh', async () => {
    const wrapper = await mountPanel(RUNNING)
    await wrapper.find('button').trigger('click')
    expect(status).toHaveBeenCalledTimes(2)
  })
})
