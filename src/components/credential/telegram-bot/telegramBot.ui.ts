import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'
import { BotDelivery, BotStatus, type BotCounters, type BotFacts } from './telegramBot.types'

// Presentation of the bot's delivery. Records make a missing enum member a compile error.

export interface BotStatusUi {
  readonly label: string
  readonly color: BadgeColor
  /** What it means for the user, shown when the server gives no message of its own. */
  readonly hint: string
}

export const BOT_STATUS_UI: Readonly<Record<BotStatus, BotStatusUi>> = {
  [BotStatus.STARTING]: { label: 'Starting', color: 'sky', hint: 'Delivery is being set up' },
  [BotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Updates arrive' },
  [BotStatus.CONFLICT]: {
    label: 'Conflict',
    color: 'error',
    hint: 'Another process polls this bot or set its webhook; stop it, or the bot receives nothing here',
  },
  [BotStatus.TOKEN_REVOKED]: { label: 'Token revoked', color: 'error', hint: 'Telegram refuses the token; paste a new one from @BotFather' },
  [BotStatus.WEBHOOK_FAILING]: { label: 'Webhook failing', color: 'warning', hint: 'Telegram cannot deliver to the webhook' },
  [BotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'Telegram cannot be reached; polling retries' },
  [BotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this bot' },
}

export const DELIVERY_UI: Readonly<Record<BotDelivery, { readonly label: string; readonly icon: SlbIconName }>> = {
  [BotDelivery.POLLING]: { label: 'Long polling', icon: 'action_refresh' },
  [BotDelivery.WEBHOOK]: { label: 'Webhook', icon: 'dev_webhook' },
}

type CapabilityKey = keyof Pick<BotFacts, 'canJoinGroups' | 'readsAllGroupMessages' | 'supportsInlineQueries'>

/** Capabilities set in @BotFather, in the order shown. */
export const CAPABILITIES: readonly { readonly key: CapabilityKey; readonly label: string; readonly off: string }[] = [
  { key: 'canJoinGroups', label: 'Joins groups', off: 'Cannot be added to groups' },
  { key: 'readsAllGroupMessages', label: 'Reads all group messages', off: 'Privacy mode: in groups only commands, replies and mentions' },
  { key: 'supportsInlineQueries', label: 'Inline mode', off: 'Inline mode is off' },
]

/** Counters in the order shown. */
export const COUNTERS: readonly { readonly key: keyof BotCounters; readonly label: string }[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'ignored', label: 'Ignored' },
]

/** @returns a date and time in the user's locale, a dash for none */
export function formatMoment(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString() : '—'
}
