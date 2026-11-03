import type { Component } from 'vue'
import { CredentialType } from '@/stores/credential/types'
import TelegramBotPanel from './telegram-bot/TelegramBotPanel.vue'

/**
 * A live panel shown under the form of an existing credential, for types with state beyond their data (a bot's
 * delivery). Exhaustive, so a new type is a conscious choice; every panel takes the `credential` prop.
 */
export const CREDENTIAL_PANELS: Readonly<Record<CredentialType, Component | null>> = {
  [CredentialType.TELEGRAM_ACCOUNT]: null,
  [CredentialType.VIBER_ACCOUNT]: null,
  [CredentialType.WHATSAPP_ACCOUNT]: null,
  [CredentialType.TELEGRAM_BOT]: TelegramBotPanel,
  [CredentialType.VIBER_BOT]: null,
  [CredentialType.WHATSAPP_BOT]: null,
  [CredentialType.MESSENGER_BOT]: null,
  [CredentialType.INSTAGRAM_BOT]: null,
  [CredentialType.OPENAI]: null,
  [CredentialType.ANTHROPIC]: null,
  [CredentialType.GEMINI]: null,
  [CredentialType.API_KEY]: null,
  [CredentialType.BASIC_AUTH]: null,
  [CredentialType.BEARER_TOKEN]: null,
  [CredentialType.REDIS]: null,
}
