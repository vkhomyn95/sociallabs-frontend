import type { Component } from 'vue'
import { CredentialType } from '@/stores/credential/types'
import InstagramBotPanel from './instagram-bot/InstagramBotPanel.vue'
import MessengerBotPanel from './messenger-bot/MessengerBotPanel.vue'
import TelegramBotPanel from './telegram-bot/TelegramBotPanel.vue'
import TikTokAccountPanel from './tiktok-account/TikTokAccountPanel.vue'
import ViberBotPanel from './viber-bot/ViberBotPanel.vue'
import WhatsAppAccountPanel from './whatsapp-account/WhatsAppAccountPanel.vue'
import WhatsAppBotPanel from './whatsapp-bot/WhatsAppBotPanel.vue'
import XChatBotPanel from './xchat-bot/XChatBotPanel.vue'

/**
 * A live panel shown under the form of an existing credential, for types with state beyond their data (a bot's
 * delivery). Exhaustive, so a new type is a conscious choice; every panel takes the `credential` prop.
 */
export const CREDENTIAL_PANELS: Readonly<Record<CredentialType, Component | null>> = {
  [CredentialType.TELEGRAM_ACCOUNT]: null,
  [CredentialType.VIBER_ACCOUNT]: null,
  [CredentialType.WHATSAPP_ACCOUNT]: WhatsAppAccountPanel,
  [CredentialType.INSTAGRAM_ACCOUNT]: null,
  [CredentialType.TIKTOK_ACCOUNT]: TikTokAccountPanel,
  [CredentialType.TELEGRAM_BOT]: TelegramBotPanel,
  [CredentialType.VIBER_BOT]: ViberBotPanel,
  [CredentialType.WHATSAPP_BOT]: WhatsAppBotPanel,
  [CredentialType.MESSENGER_BOT]: MessengerBotPanel,
  [CredentialType.INSTAGRAM_BOT]: InstagramBotPanel,
  [CredentialType.XCHAT_BOT]: XChatBotPanel,
  [CredentialType.OPENAI]: null,
  [CredentialType.ANTHROPIC]: null,
  [CredentialType.GEMINI]: null,
  [CredentialType.API_KEY]: null,
  [CredentialType.BASIC_AUTH]: null,
  [CredentialType.BEARER_TOKEN]: null,
  [CredentialType.REDIS]: null,
}
