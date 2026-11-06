// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Credential } from '@/stores/credential/types'
import { CREDENTIAL_PANELS } from '../../credential-panels'
import { CredentialType } from '@/stores/credential/types'
import WhatsAppAccountPanel from '../WhatsAppAccountPanel.vue'
import { WhatsAppAccountService } from '../whatsappAccount.service'
import { WhatsAppAccountState, type WhatsAppAccountStatusResponse } from '../whatsappAccount.types'

vi.mock('../whatsappAccount.service', () => ({
  WhatsAppAccountService: { status: vi.fn(), reconnect: vi.fn() },
}))

const status = vi.mocked(WhatsAppAccountService.status)
const reconnect = vi.mocked(WhatsAppAccountService.reconnect)

const CREDENTIAL = { id: 9, type: 'WHATSAPP_ACCOUNT', name: '+380509999999' } as unknown as Credential

const running = (state: WhatsAppAccountState, changes: Partial<WhatsAppAccountStatusResponse> = {}): WhatsAppAccountStatusResponse => ({
  running: true,
  state,
  stateChangedAt: '2026-11-06T10:00:00Z',
  phoneNumber: '380509999999',
  name: 'Shop',
  deviceName: 'SocialLabs',
  counters: { received: 12, offline: 2, filtered: 3, handled: 9, dropped: 0, pending: 0, subscribers: 1 },
  ...changes,
})

async function mountPanel(answer: WhatsAppAccountStatusResponse) {
  status.mockResolvedValue(answer)
  const panel = mount(WhatsAppAccountPanel, { props: { credential: CREDENTIAL } })
  await flushPromises()
  return panel
}

describe('WhatsAppAccountPanel', () => {
  beforeEach(() => {
    status.mockReset()
    reconnect.mockReset()
  })

  it('is the panel of WhatsApp accounts', () => {
    expect(CREDENTIAL_PANELS[CredentialType.WHATSAPP_ACCOUNT]).toBe(WhatsAppAccountPanel)
  })

  it('shows a connected account with its number, device and counters, and no reconnect', async () => {
    const panel = await mountPanel(running(WhatsAppAccountState.READY))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Connected')
    expect(panel.text()).toContain('Shop · +380509999999')
    expect(panel.text()).toContain('“SocialLabs”')
    expect(panel.text()).toContain('From backlog')
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
    expect(panel.text()).toContain('Risk of a ban')
  })

  it('says an unlinked account must be linked again and offers no reconnect', async () => {
    const panel = await mountPanel(running(WhatsAppAccountState.LOGGED_OUT, { stateReason: 'LOGGED_OUT' }))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Unlinked')
    expect(panel.text()).toContain('connect the account again')
    expect(panel.find('[data-test="reconnect"]').exists()).toBe(false)
  })

  it('starts an account that is not running', async () => {
    const panel = await mountPanel({ running: false, phoneNumber: '380509999999', deviceName: 'SocialLabs' })
    reconnect.mockResolvedValue(running(WhatsAppAccountState.CONNECTING))

    expect(panel.find('[data-test="account-state"]').text()).toBe('Not running')
    await panel.find('[data-test="reconnect"]').trigger('click')
    await flushPromises()

    expect(reconnect).toHaveBeenCalledWith(9)
    expect(panel.find('[data-test="account-state"]').text()).toBe('Connecting')
  })
})
