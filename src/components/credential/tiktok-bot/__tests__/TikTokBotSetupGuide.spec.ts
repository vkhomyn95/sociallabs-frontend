// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { CredentialType } from '@/stores/credential/types'
import { CONNECT_GUIDES } from '../../connect/connect-guides'
import TikTokBotSetupGuide from '../TikTokBotSetupGuide.vue'
import { TikTokBotService } from '../tiktokBot.service'

vi.mock('../tiktokBot.service', () => ({ TikTokBotService: { setup: vi.fn() } }))

const setup = vi.mocked(TikTokBotService.setup)

describe('TikTokBotSetupGuide', () => {
  beforeEach(() => setup.mockReset())

  it('guides the TikTok bot connect form', () => {
    expect(CONNECT_GUIDES[CredentialType.TIKTOK_BOT]).toBeDefined()
    expect(CONNECT_GUIDES[CredentialType.XCHAT_BOT]).toBeUndefined()
  })

  it('names the redirect URL the app must list before the authorization URL is copied', async () => {
    setup.mockResolvedValue({ publicAddress: true, callbackUrl: 'https://srv.example/api/v1/public/tiktok/oauth/callback/' })
    const wrapper = mount(TikTokBotSetupGuide)
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('TikTok account holder redirect URLs')
    expect(text).toContain('/tiktok/oauth/callback/')
    expect(text).toContain('Business Messaging')
    expect(text).not.toContain('No public address')
  })

  it('says why connecting cannot finish without a public HTTPS address', async () => {
    setup.mockResolvedValue({ publicAddress: false, configuredUrl: 'http://localhost:8080' })
    const wrapper = mount(TikTokBotSetupGuide)
    await flushPromises()
    expect(wrapper.text()).toContain('No public address')
    expect(wrapper.text()).toContain('http://localhost:8080')
  })
})
