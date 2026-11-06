import api from '@/core/services/api'
import type { WhatsAppBotStatusResponse, WhatsAppTemplateStructureResponse } from './whatsappBot.types'

export const WhatsAppBotService = {
  /** Delivery status of a number; asks Meta about the number and its webhook, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<WhatsAppBotStatusResponse> {
    const { data } = await api.get<WhatsAppBotStatusResponse>(`/credentials/${credentialId}/whatsapp-bot/status`, {
      timeout: 25_000,
      signal,
    })
    return data
  },

  /** What a template of the number asks for when sent, per language; Meta's refusal comes back as `error`. */
  async templateStructure(credentialId: number, name: string): Promise<WhatsAppTemplateStructureResponse> {
    const { data } = await api.get<WhatsAppTemplateStructureResponse>(
      `/credentials/${credentialId}/whatsapp-bot/template-structure`,
      { params: { name }, timeout: 25_000 },
    )
    return data
  },
}
