// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Credential } from '@/stores/credential/types'
import { CredentialType } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import TikTokAccountPanel from '../TikTokAccountPanel.vue'
import { TikTokAccountService } from '../tiktokAccount.service'
import { TikTokAccountState, type TikTokAccountStatusResponse } from '../tiktokAccount.types'

vi.mock('../tiktokAccount.service', () => ({
  TikTokAccountService: { status: vi.fn(), reconnect: vi.fn() },
}))

const status = vi.mocked(TikTokAccountService.status)
const reconnect = vi.mocked(TikTokAccountService.reconnect)

const CREDENTIAL = { id: 11, type: 'TIKTOK_ACCOUNT', name: '@shop.ua' } as unknown as Credential

const running = (state: TikTokAccountState, changes: Partial<TikTokAccountStatusResponse> = {}): TikTokAccountStatusResponse => ({
  running: true,
  state,
  stateChangedAt: '2026-11-18T10:00:00Z',
  username: 'shop.ua',
  nickname: 'Shop',
  lastEventAt: '2026-11-18T10:05:00Z',
  counters: { received: 12, filtered: 3, handled: 9, dropped: 0, pending: 0, subscribers: 1 },
  ...changes,
})

async function mountPanel(answer: TikTokAccountStatusResponse) {
  status.mockResolvedValue(answer)
  const panel = mount(TikTokAccountPanel, { props: { credential: CREDENTIAL } })
  await flushPromises()
  return panel
}

describe('TikTokAccountPanel', () => {
  beforeEach(() => {
    status.mockReset()
    reconnect.mockReset()
  })

  it('is the panel of TikTok accounts', () => {
    expect(CREDENTIAL_PANELS[CredentialType.TIKTOK_ACCOUNT]).toBe(TikTokAccountPanel)
  })

  it('shows a connected account with who it is, its last event and counters, and no reconnect', async () => {
    const panel = await mountPanel(running(TikTokAccountState.READY))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Connected')
    expect(panel.text()).toContain('Shop · @shop.ua')
    expect(panel.find('[data-test="last-event"]').text()).toContain('Last event')
    expect(panel.find('[data-test="paused-until"]').exists()).toBe(false)
    expect(panel.text()).toContain('Not wanted')
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
    expect(panel.text()).toContain('Risk of restrictions')
  })

  it('shows when a rate-limit pause ends and lets a stuck account restart', async () => {
    const panel = await mountPanel(running(TikTokAccountState.RATE_LIMITED, { pausedUntil: '2026-11-18T10:10:00Z' }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Rate limited')
    expect(panel.find('[data-test="paused-until"]').exists()).toBe(true)
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(true)
  })

  it('says an ended session must be connected again and offers no reconnect', async () => {
    const panel = await mountPanel(running(TikTokAccountState.LOGIN_REQUIRED, { stateReason: 'session expired' }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Login required')
    expect(panel.text()).toContain('(session expired)')
    expect(panel.find('[data-test="login-again"]').exists()).toBe(true)
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
  })

  it('starts an account that is not running', async () => {
    const panel = await mountPanel({ running: false, username: 'shop.ua' })
    reconnect.mockResolvedValue(running(TikTokAccountState.CONNECTING, { lastEventAt: undefined }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Not running')
    expect(panel.find('[data-test="last-event"]').exists()).toBe(false)
    await panel.find('[data-test="reconnect"]').trigger('click')
    await flushPromises()

    expect(reconnect).toHaveBeenCalledWith(11)
    expect(panel.find('[data-test="account-state"]').text()).toBe('Connecting')
    expect(panel.find('[data-test="last-event"]').text()).toBe('No events since the account started')
  })
})
