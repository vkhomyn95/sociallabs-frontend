import api from '@/core/services/api'
import type { XChatAccountStatusResponse } from './xchatAccount.types'

export const XChatAccountService = {
  /** State of a connected account as the shim last reported it; nothing is asked of X. */
  async status(credentialId: number, signal?: AbortSignal): Promise<XChatAccountStatusResponse> {
    const { data } = await api.get<XChatAccountStatusResponse>(
      `/credentials/${credentialId}/xchat-account/status`,
      { signal },
    )
    return data
  },

  /**
   * Attaches a stopped or not running account, restarts a stuck one in the shim. An account whose session or keys
   * are gone, or that X restricted, is refused (409): it must be connected again.
   */
  async reconnect(credentialId: number): Promise<XChatAccountStatusResponse> {
    const { data } = await api.post<XChatAccountStatusResponse>(
      `/credentials/${credentialId}/xchat-account/reconnect`,
    )
    return data
  },
}
