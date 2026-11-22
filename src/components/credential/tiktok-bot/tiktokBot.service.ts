import api from '@/core/services/api'
import type { TikTokBotSetupResponse, TikTokBotStatusResponse } from './tiktokBot.types'

export const TikTokBotService = {
  /** Status of a bot; asks TikTok about the account, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<TikTokBotStatusResponse> {
    const { data } = await api.get<TikTokBotStatusResponse>(`/credentials/${credentialId}/tiktok-bot/status`, {
      timeout: 20_000,
      signal,
    })
    return data
  },

  /** What a TikTok app needs before a bot is connected: the redirect URL it must list. */
  async setup(signal?: AbortSignal): Promise<TikTokBotSetupResponse> {
    const { data } = await api.get<TikTokBotSetupResponse>('/credentials/tiktok-bot/setup', { signal })
    return data
  },

  /** Allows or forbids replacing the app's webhook when it points to another address. */
  async allowReplacingForeignCallback(credentialId: number, allowed: boolean): Promise<void> {
    await api.put(`/credentials/${credentialId}/tiktok-bot/foreign-callback`, { allowed })
  },
}
