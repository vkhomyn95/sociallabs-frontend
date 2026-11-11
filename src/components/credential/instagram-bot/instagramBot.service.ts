import api from '@/core/services/api'
import type { InstagramBotStatusResponse } from './instagramBot.types'

export const InstagramBotService = {
  /** Delivery status of an account; asks Instagram about the account and its subscription, so it may take seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<InstagramBotStatusResponse> {
    const { data } = await api.get<InstagramBotStatusResponse>(`/credentials/${credentialId}/instagram-bot/status`, {
      timeout: 25_000,
      signal,
    })
    return data
  },
}
