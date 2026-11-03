import api from '@/core/services/api'
import type { TelegramBotStatus } from './telegramBot.types'

export const TelegramBotService = {
  /** Delivery status of a bot; asks Telegram for its webhook, so it may take a few seconds. */
  async status(credentialId: number, signal?: AbortSignal): Promise<TelegramBotStatus> {
    const { data } = await api.get<TelegramBotStatus>(`/credentials/${credentialId}/telegram-bot/status`, {
      timeout: 20_000,
      signal,
    })
    return data
  },
}
