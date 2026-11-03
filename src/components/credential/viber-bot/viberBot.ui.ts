import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { ViberBotStatus, type ViberBotCounters } from './viberBot.types'

// Presentation of the bot's delivery. Records make a missing enum member a compile error.

export const VIBER_STATUS_UI: Readonly<Record<ViberBotStatus, BotStatusUi>> = {
  [ViberBotStatus.STARTING]: { label: 'Starting', color: 'sky', hint: 'The webhook is being set' },
  [ViberBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Callbacks arrive' },
  [ViberBotStatus.TOKEN_INVALID]: {
    label: 'Token invalid',
    color: 'error',
    hint: 'Viber refuses the token; paste the one from the Viber Admin Panel',
  },
  [ViberBotStatus.ACCOUNT_BLOCKED]: { label: 'Blocked', color: 'error', hint: 'Viber blocked or suspended the bot' },
  [ViberBotStatus.WEBHOOK_FAILING]: {
    label: 'Webhook failing',
    color: 'warning',
    hint: 'Viber cannot reach or accept the webhook address',
  },
  [ViberBotStatus.WEBHOOK_CHANGED]: {
    label: 'Webhook changed',
    color: 'error',
    hint: 'The webhook was pointed elsewhere, outside this server; the bot receives nothing here',
  },
  [ViberBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'Viber cannot be reached' },
  [ViberBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this bot' },
}

/** Counters in the order shown. */
export const VIBER_COUNTERS: readonly CounterItem<keyof ViberBotCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'welcomed', label: 'Welcomed' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'ignored', label: 'Ignored' },
]
