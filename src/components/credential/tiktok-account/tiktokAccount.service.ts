import api from '@/core/services/api'
import type { TikTokAccountStatusResponse } from './tiktokAccount.types'

export const TikTokAccountService = {
  /** State of a connected account as the shim last reported it; nothing is asked of TikTok. */
  async status(credentialId: number, signal?: AbortSignal): Promise<TikTokAccountStatusResponse> {
    const { data } = await api.get<TikTokAccountStatusResponse>(`/credentials/${credentialId}/tiktok-account/status`, {
      signal,
    })
    return data
  },

  /**
   * Attaches a stopped or not running account, restarts a stuck one in the shim. An account whose session ended is
   * refused (409): it must be connected again.
   */
  async reconnect(credentialId: number): Promise<TikTokAccountStatusResponse> {
    const { data } = await api.post<TikTokAccountStatusResponse>(`/credentials/${credentialId}/tiktok-account/reconnect`)
    return data
  },
}
