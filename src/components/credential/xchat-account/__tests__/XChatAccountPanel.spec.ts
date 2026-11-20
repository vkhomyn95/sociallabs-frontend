// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Credential } from '@/stores/credential/types'
import { CredentialType } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import XChatAccountPanel from '../XChatAccountPanel.vue'
import { XChatAccountService } from '../xchatAccount.service'
import { XChatAccountState, type XChatAccountStatusResponse } from '../xchatAccount.types'

vi.mock('../xchatAccount.service', () => ({
  XChatAccountService: { status: vi.fn(), reconnect: vi.fn() },
}))

const status = vi.mocked(XChatAccountService.status)
const reconnect = vi.mocked(XChatAccountService.reconnect)

const CREDENTIAL = { id: 12, type: 'XCHAT_ACCOUNT', name: '@shop_ua' } as unknown as Credential

const running = (
  state: XChatAccountState,
  changes: Partial<XChatAccountStatusResponse> = {},
): XChatAccountStatusResponse => ({
  running: true,
  state,
  stateChangedAt: '2026-11-19T10:00:00Z',
  needsReconnect: false,
  username: 'shop_ua',
  name: 'Shop',
  lastEventAt: '2026-11-19T10:05:00Z',
  counters: { received: 12, filtered: 3, handled: 9, dropped: 0, pending: 0, subscribers: 1 },
  ...changes,
})

async function mountPanel(answer: XChatAccountStatusResponse) {
  status.mockResolvedValue(answer)
  const panel = mount(XChatAccountPanel, { props: { credential: CREDENTIAL } })
  await flushPromises()
  return panel
}

describe('XChatAccountPanel', () => {
  beforeEach(() => {
    status.mockReset()
    reconnect.mockReset()
  })

  it('is the panel of X accounts for XChat', () => {
    expect(CREDENTIAL_PANELS[CredentialType.XCHAT_ACCOUNT]).toBe(XChatAccountPanel)
  })

  it('shows a connected account with who it is, its last event and counters, and no reconnect', async () => {
    const panel = await mountPanel(running(XChatAccountState.READY))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Connected')
    expect(panel.text()).toContain('Shop · @shop_ua')
    expect(panel.find('[data-test="last-event"]').text()).toContain('Last event')
    expect(panel.find('[data-test="paused-until"]').exists()).toBe(false)
    expect(panel.text()).toContain('Not wanted')
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
    expect(panel.find('[data-test="connect-again"]').exists()).toBe(false)
    expect(panel.text()).toContain('Risk of restrictions')
  })

  it('shows when a pause after X throttled the account ends and lets it restart', async () => {
    const panel = await mountPanel(running(XChatAccountState.RATE_LIMITED, { pausedUntil: '2026-11-19T10:10:00Z' }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Rate limited')
    expect(panel.find('[data-test="paused-until"]').exists()).toBe(true)
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(true)
  })

  it.each([
    [XChatAccountState.XCHAT_LOCKED, 'Enter the PIN again'],
    [XChatAccountState.LOGIN_REQUIRED, 'Log in again'],
    [XChatAccountState.SUSPENDED, 'Restricted by X'],
  ])('says %s must be connected again and offers no reconnect', async (state, title) => {
    const panel = await mountPanel(running(state, { needsReconnect: true, stateReason: 'from X' }))

    expect(panel.text()).toContain('(from X)')
    expect(panel.find('[data-test="connect-again"]').text()).toContain(title)
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
  })

  it('starts an account that is not running', async () => {
    const panel = await mountPanel({ running: false, needsReconnect: false, username: 'shop_ua' })
    reconnect.mockResolvedValue(running(XChatAccountState.CONNECTING, { lastEventAt: undefined }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Not running')
    expect(panel.find('[data-test="last-event"]').exists()).toBe(false)
    await panel.find('[data-test="reconnect"]').trigger('click')
    await flushPromises()

    expect(reconnect).toHaveBeenCalledWith(12)
    expect(panel.find('[data-test="account-state"]').text()).toBe('Connecting')
    expect(panel.find('[data-test="last-event"]').text()).toBe('No events since the account started')
  })
})
