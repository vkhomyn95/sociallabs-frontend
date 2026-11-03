// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import ViberBotPanel from '../ViberBotPanel.vue'
import { ViberBotService } from '../viberBot.service'
import { ViberBotStatus, type ViberBotStatusResponse } from '../viberBot.types'

vi.mock('../viberBot.service', () => ({ ViberBotService: { status: vi.fn() } }))

const credential: Credential = {
  id: 9,
  name: 'Shop bot',
  type: CredentialType.VIBER_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.VIBER,
  status: CredentialStatus.ACTIVE,
  metadata: {},
  usageCount: 1,
  createdAt: '2026-11-03T10:00:00',
}

const HOOK = 'https://srv.example/api/v1/public/viber/bots/h1'

const RUNNING: ViberBotStatusResponse = {
  status: ViberBotStatus.READY,
  statusChangedAt: '2026-11-03T10:00:00Z',
  counters: { received: 1200, handled: 1190, pending: 1, duplicates: 2, dropped: 0, ignored: 7, welcomed: 40 },
  subscribers: { seen: 30, subscribed: 25 },
  publicAddress: true,
  webhookUrl: HOOK,
  account: {
    id: 'pa:42',
    name: 'Shop',
    uri: 'shop',
    webhook: HOOK,
    webhookHere: true,
    eventTypes: ['delivered', 'seen'],
    subscribersCount: 120,
  },
}

const status = vi.mocked(ViberBotService.status)

async function mountPanel(answer: ViberBotStatusResponse) {
  status.mockResolvedValue(answer)
  const wrapper = mount(ViberBotPanel, { props: { credential } })
  await flushPromises()
  return wrapper
}

describe('ViberBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('is the panel of Viber bot credentials', () => {
    expect(CREDENTIAL_PANELS[CredentialType.VIBER_BOT]).toBe(ViberBotPanel)
  })

  it('shows a receiving bot with its users, counters, webhook and events', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(9, expect.any(AbortSignal))
    expect(text).toContain('Receiving')
    expect(text).toContain('Shop · shop')
    expect(text).toContain('25 subscribed of 30 seen')
    expect(text).toContain('Welcomed')
    expect(text).toContain('1,200')
    expect(text).toContain('/viber/bots/h1')
    expect(text).toContain('delivered')
    expect(text).toContain('Paid messages')
    expect(text).not.toContain('points to another address')
  })

  it('calls out a webhook set elsewhere and a server without a public address', async () => {
    const idle: ViberBotStatusResponse = {
      status: ViberBotStatus.CLOSED,
      subscribers: { seen: 0, subscribed: 0 },
      publicAddress: false,
      account: { ...RUNNING.account!, webhook: 'https://old.example/hook', webhookHere: false },
    }
    const text = (await mountPanel(idle)).text()
    expect(text).toContain('Idle')
    expect(text).toContain('No public address')
    expect(text).toContain('points to another address')
    expect(text).not.toContain('Received')
  })

  it('reports a Viber that did not answer as a warning, not an error of the panel', async () => {
    const text = (
      await mountPanel({
        status: ViberBotStatus.CLOSED,
        subscribers: { seen: 3, subscribed: 3 },
        publicAddress: true,
        accountError: 'invalidAuthToken',
      })
    ).text()
    expect(text).toContain('Viber did not answer')
    expect(text).toContain('invalidAuthToken')
    expect(text).toContain('3 subscribed of 3 seen')
  })

  it('reloads on refresh', async () => {
    const wrapper = await mountPanel(RUNNING)
    await wrapper.find('button').trigger('click')
    expect(status).toHaveBeenCalledTimes(2)
  })
})
