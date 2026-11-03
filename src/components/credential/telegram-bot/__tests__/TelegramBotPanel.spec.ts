// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialKind, CredentialPlatform, CredentialStatus, CredentialType, type Credential } from '@/stores/credential/types'
import TelegramBotPanel from '../TelegramBotPanel.vue'
import { TelegramBotService } from '../telegramBot.service'
import { botFactsOf } from '../telegramBotFacts'
import { BotDelivery, BotStatus, type TelegramBotStatus } from '../telegramBot.types'

vi.mock('../telegramBot.service', () => ({ TelegramBotService: { status: vi.fn() } }))

const METADATA = {
  username: 'shop_bot',
  botId: '123456',
  canJoinGroups: 'true',
  canReadAllGroupMessages: 'false',
  supportsInlineQueries: 'true',
}

const credential = (metadata: Record<string, string> = METADATA): Credential => ({
  id: 7,
  name: '@shop_bot',
  type: CredentialType.TELEGRAM_BOT,
  kind: CredentialKind.BOT,
  platform: CredentialPlatform.TELEGRAM,
  status: CredentialStatus.ACTIVE,
  metadata,
  usageCount: 1,
  createdAt: '2026-11-01T10:00:00',
})

const RUNNING: TelegramBotStatus = {
  delivery: BotDelivery.WEBHOOK,
  status: BotStatus.WEBHOOK_FAILING,
  statusMessage: 'Connection timed out',
  statusChangedAt: '2026-11-03T10:00:00Z',
  counters: { received: 1200, handled: 1190, pending: 3, duplicates: 2, dropped: 0, ignored: 5 },
  knownChats: 12,
  webhook: {
    url: 'https://srv.example/api/v1/public/telegram/bots/h1',
    pendingUpdates: 4,
    lastErrorAt: '2026-11-03T09:59:00Z',
    lastErrorMessage: 'Connection timed out',
    maxConnections: 40,
    allowedUpdates: ['message'],
  },
}

const status = vi.mocked(TelegramBotService.status)

async function mountPanel(answer: TelegramBotStatus, metadata?: Record<string, string>) {
  status.mockResolvedValue(answer)
  const wrapper = mount(TelegramBotPanel, { props: { credential: credential(metadata) } })
  await flushPromises()
  return wrapper
}

describe('TelegramBotPanel', () => {
  beforeEach(() => status.mockReset())

  it('shows a failing webhook with its address, queue, last error and counters', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(status).toHaveBeenCalledWith(7, expect.any(AbortSignal))
    expect(text).toContain('Webhook failing')
    expect(text).toContain('12 known chats')
    expect(text).toContain('/telegram/bots/h1')
    expect(text).toContain('Last delivery failed')
    expect(text).toContain('1,200')
  })

  it('tells an idle polled bot apart and calls out a webhook left on it', async () => {
    const idle: TelegramBotStatus = {
      delivery: BotDelivery.POLLING,
      status: BotStatus.CLOSED,
      knownChats: 0,
      webhook: { url: 'https://old.example/hook', pendingUpdates: 0, maxConnections: 40, allowedUpdates: [] },
    }
    const text = (await mountPanel(idle)).text()
    expect(text).toContain('Idle')
    expect(text).toContain('No active trigger listens to this bot')
    expect(text).toContain('it is removed when a trigger starts polling')
    expect(text).not.toContain('Received')
  })

  it('reports a Telegram that did not answer as a warning, not an error of the panel', async () => {
    const text = (await mountPanel({ delivery: BotDelivery.POLLING, status: BotStatus.CLOSED, knownChats: 0, webhookError: 'Unauthorized' })).text()
    expect(text).toContain('Telegram did not answer')
    expect(text).toContain('Unauthorized')
  })

  it('lists capabilities from the last check, privacy mode included', async () => {
    const text = (await mountPanel(RUNNING)).text()
    expect(text).toContain('Joins groups')
    expect(text).toContain('Privacy mode')
    expect(text).toContain('Inline mode')
  })

  it('reloads on refresh', async () => {
    const wrapper = await mountPanel(RUNNING)
    await wrapper.find('button').trigger('click')
    expect(status).toHaveBeenCalledTimes(2)
  })
})

describe('botFactsOf', () => {
  it('reads the facts of a checked token and nothing before a check', () => {
    expect(botFactsOf(METADATA)).toEqual({
      username: 'shop_bot',
      botId: '123456',
      canJoinGroups: true,
      readsAllGroupMessages: false,
      supportsInlineQueries: true,
    })
    expect(botFactsOf({ token: '1234…' })).toBeNull()
  })
})
