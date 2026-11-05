import api from '@/core/services/api'
import type { WhatsAppBotStatusResponse } from './whatsappBot.types'

export const WhatsAppBotService = {
  /** Delivery status of a number; asks Meta about the number and its webhook, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<WhatsAppBotStatusResponse> {
    const { data } = await api.get<WhatsAppBotStatusResponse>(`/credentials/${credentialId}/whatsapp-bot/status`, {
      timeout: 25_000,
      signal,
    })
    return data
  },
}
