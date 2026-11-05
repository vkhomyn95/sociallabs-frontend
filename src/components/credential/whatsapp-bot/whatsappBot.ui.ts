import type { BadgeColor } from '@sociallabs/frontend-components'
import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { WhatsAppBotStatus, WhatsAppQualityRating, type WhatsAppBotCounters } from './whatsappBot.types'

// Presentation of the number's delivery. Records make a missing enum member a compile error.

export const WHATSAPP_STATUS_UI: Readonly<Record<WhatsAppBotStatus, BotStatusUi>> = {
  [WhatsAppBotStatus.STARTING]: { label: 'Starting', color: 'sky', hint: 'The number is checked and its webhook set' },
  [WhatsAppBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Webhooks arrive' },
  [WhatsAppBotStatus.NO_PUBLIC_URL]: {
    label: 'No public address',
    color: 'error',
    hint: 'Meta delivers only by webhook, which needs the server’s public HTTPS address (app.public-url)',
  },
  [WhatsAppBotStatus.NO_APP_SECRET]: {
    label: 'No app secret',
    color: 'error',
    hint: 'Add the app secret to the credential; webhook signatures cannot be checked without it',
  },
  [WhatsAppBotStatus.TOKEN_INVALID]: {
    label: 'Token invalid',
    color: 'error',
    hint: 'Meta refuses the token or its permissions; paste a system user token with whatsapp_business_messaging',
  },
  [WhatsAppBotStatus.WEBHOOK_UNVERIFIED]: {
    label: 'Set the webhook',
    color: 'warning',
    hint: 'Meta did not take the address automatically; set it in the App Dashboard with the verify token below',
  },
  [WhatsAppBotStatus.WEBHOOK_CHANGED]: {
    label: 'Webhook changed',
    color: 'error',
    hint: 'The number’s webhook was pointed elsewhere, outside this server; nothing is received here',
  },
  [WhatsAppBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'Meta cannot be reached' },
  [WhatsAppBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this number' },
}

export const QUALITY_COLORS: Readonly<Record<WhatsAppQualityRating, BadgeColor>> = {
  [WhatsAppQualityRating.GREEN]: 'success',
  [WhatsAppQualityRating.YELLOW]: 'warning',
  [WhatsAppQualityRating.RED]: 'error',
  [WhatsAppQualityRating.UNKNOWN]: 'gray',
}

/** @returns the badge color of Meta's rating; gray for a value this client does not know */
export function qualityColor(rating: string | null | undefined): BadgeColor {
  const known = Object.values(WhatsAppQualityRating).find((value) => value === rating)
  return known ? QUALITY_COLORS[known] : QUALITY_COLORS[WhatsAppQualityRating.UNKNOWN]
}

/** Counters in the order shown. */
export const WHATSAPP_COUNTERS: readonly CounterItem<keyof WhatsAppBotCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'foreign', label: 'Other numbers' },
]
