import api from '@/core/services/api'
import type { WhatsAppAccountStatusResponse } from './whatsappAccount.types'

export const WhatsAppAccountService = {
  /** State of a linked account as its client last reported it; nothing is asked of WhatsApp. */
  async status(credentialId: number, signal?: AbortSignal): Promise<WhatsAppAccountStatusResponse> {
    const { data } = await api.get<WhatsAppAccountStatusResponse>(`/credentials/${credentialId}/whatsapp-account/status`, {
      signal,
    })
    return data
  },

  /** Starts the account again when it was closed or is not running; an unlinked or banned one must be linked again. */
  async reconnect(credentialId: number): Promise<WhatsAppAccountStatusResponse> {
    const { data } = await api.post<WhatsAppAccountStatusResponse>(
      `/credentials/${credentialId}/whatsapp-account/reconnect`,
    )
    return data
  },
}
