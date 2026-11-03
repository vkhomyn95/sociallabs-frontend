import api from '@/core/services/api'
import type { ViberBotStatusResponse } from './viberBot.types'

export const ViberBotService = {
  /** Delivery status of a bot; asks Viber about the bot, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<ViberBotStatusResponse> {
    const { data } = await api.get<ViberBotStatusResponse>(`/credentials/${credentialId}/viber-bot/status`, {
      timeout: 20_000,
      signal,
    })
    return data
  },
}
