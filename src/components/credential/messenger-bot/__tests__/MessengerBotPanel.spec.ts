// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import MessengerBotPanel from '../MessengerBotPanel.vue'
import { MetaBotStatus, type MetaBotStatusResponse } from '../../meta-bot/metaBot.types'

const { status } = vi.hoisted(() => ({ status: vi.fn() }))
vi.mock('../../meta-bot/metaBot.service', () => ({ metaBotStatus: () => status }))

const credential: Credential = {
  id: 13,
  name: 'The Shop',
  type: CredentialType.MESSENGER_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.MESSENGER,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-12T10:00:00',
}

const READY: MetaBotStatusResponse = {
  status: MetaBotStatus.READY,
  statusChangedAt: '2026-11-12T10:00:00Z',
  counters: { received: 300, handled: 300, pending: 0, duplicates: 1, dropped: 0, foreign: 0 },
  contacts: { seen: 12, inWindow: 3 },
  publicAddress: true,
  appSecret: true,
  webhookUrl: 'https://srv.example/api/v1/public/messenger/bots/h1',
  verifyToken: 'verify-1',
  webhookVerified: true,
  account: { id: '1050', name: 'The Shop', type: 'Shopping & retail' },
  subscription: { subscribed: true, fields: ['messages', 'feed'] },
}

async function mountPanel(answer: MetaBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(MessengerBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('MessengerBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('is the panel of Messenger page credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.MESSENGER_BOT]).toBe(MessengerBotPanel)
  })

  it('shows a receiving page by its name and category, with no token to renew', async () => {
    const text = (await mountPanel(READY)).text()
    expect(status).toHaveBeenCalledWith(13, expect.any(AbortSignal))
    expect(text).toContain('Page delivery')
    expect(text).toContain('Receiving')
    expect(text).toContain('The Shop')
    expect(text).toContain('Shopping & retail')
    expect(text).toContain('3 in the 24 h window of 12')
    expect(text).toContain('/messenger/bots/h1')
    expect(text).toContain('feed')
    expect(text).toContain('Page token')
    expect(text).not.toContain('Token until')
    expect(text).not.toContain('first renewal')
  })

  it('walks through the Messenger settings of the App Dashboard until Meta has checked the address', async () => {
    const text = (await mountPanel({ ...READY, status: MetaBotStatus.CLOSED, webhookVerified: false })).text()
    expect(text).toContain('Idle')
    expect(text).toContain('Messenger → Messenger API settings')
    expect(text).toContain('message_deliveries')
  })
})
