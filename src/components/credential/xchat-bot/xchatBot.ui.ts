import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { XChatBotStatus, type XChatBotCounters } from './xchatBot.types'

// Presentation of the bot's delivery. Records make a missing enum member a compile error.

export const XCHAT_STATUS_UI: Readonly<Record<XChatBotStatus, BotStatusUi>> = {
  [XChatBotStatus.STARTING]: { label: 'Starting', color: 'sky', hint: 'The webhook and subscriptions are being set up' },
  [XChatBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Messages arrive and are decrypted' },
  [XChatBotStatus.NO_PUBLIC_URL]: {
    label: 'No public address',
    color: 'warning',
    hint: 'X delivers only by webhook, which needs the server’s public HTTPS address',
  },
  [XChatBotStatus.NO_APP_BEARER]: {
    label: 'No Bearer token',
    color: 'warning',
    hint: 'Registering the webhook needs the X app’s Bearer token; connect the bot again with it',
  },
  [XChatBotStatus.TOKEN_INVALID]: {
    label: 'Authorization lost',
    color: 'error',
    hint: 'X no longer accepts the bot’s authorization; connect it again',
  },
  [XChatBotStatus.KEYS_MISSING]: {
    label: 'Keys missing',
    color: 'error',
    hint: 'The bot’s XChat keys do not open or are no longer registered; connect it again',
  },
  [XChatBotStatus.WEBHOOK_INVALID]: {
    label: 'Webhook invalid',
    color: 'warning',
    hint: 'X disabled the webhook after failed checks and it could not be re-enabled',
  },
  [XChatBotStatus.USAGE_CAPPED]: {
    label: 'Credits spent',
    color: 'error',
    hint: 'The X app’s pay-per-use credits are spent; top them up in the X developer portal',
  },
  [XChatBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'X cannot be reached' },
  [XChatBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this bot' },
}

/** Counters in the order shown. */
export const XCHAT_COUNTERS: readonly CounterItem<keyof XChatBotCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'undecryptable', label: 'Not decrypted' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'ignored', label: 'Ignored' },
]
