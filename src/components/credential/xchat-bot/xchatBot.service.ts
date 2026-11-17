import api from '@/core/services/api'
import type { XChatBotStatusResponse } from './xchatBot.types'

export const XChatBotService = {
  /** Delivery status of a bot; asks X about the account, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<XChatBotStatusResponse> {
    const { data } = await api.get<XChatBotStatusResponse>(`/credentials/${credentialId}/xchat-bot/status`, {
      timeout: 20_000,
      signal,
    })
    return data
  },
}
