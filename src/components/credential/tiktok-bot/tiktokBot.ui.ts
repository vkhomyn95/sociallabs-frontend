import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { TikTokBotCapability, TikTokBotStatus, type TikTokBotCounters } from './tiktokBot.types'

// Presentation of the bot. Records make a missing enum member a compile error.

export const TIKTOK_BOT_STATUS_UI: Readonly<Record<TikTokBotStatus, BotStatusUi>> = {
  [TikTokBotStatus.STARTING]: { label: 'Starting', color: 'sky', hint: 'The app’s webhook is being configured' },
  [TikTokBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'TikTok delivers the events triggers want' },
  [TikTokBotStatus.REAUTHORIZE_SOON]: {
    label: 'Authorize again soon',
    color: 'warning',
    hint: 'Events arrive, but the authorization ends soon; connect the account again before then',
  },
  [TikTokBotStatus.NO_PUBLIC_URL]: {
    label: 'No public address',
    color: 'warning',
    hint: 'TikTok delivers only by webhook, which needs the server’s public HTTPS address without a port',
  },
  [TikTokBotStatus.TOKEN_INVALID]: {
    label: 'Authorization lost',
    color: 'error',
    hint: 'TikTok no longer accepts the account’s authorization; connect it again',
  },
  [TikTokBotStatus.NO_MESSAGING_ACCESS]: {
    label: 'No message access',
    color: 'warning',
    hint: 'Triggers want direct messages, but the app or the account may not use Business Messaging',
  },
  [TikTokBotStatus.WEBHOOK_FOREIGN]: {
    label: 'Webhook used elsewhere',
    color: 'warning',
    hint: 'The app’s webhook points to another address; allow replacing it below to receive here',
  },
  [TikTokBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'TikTok refused or could not be reached' },
  [TikTokBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this bot' },
}

/** What each capability is called. */
export const TIKTOK_CAPABILITY_LABELS: Readonly<Record<TikTokBotCapability, string>> = {
  [TikTokBotCapability.MESSAGING]: 'Direct messages',
  [TikTokBotCapability.COMMENTS]: 'Comments',
  [TikTokBotCapability.PUBLISHING]: 'Publishing',
  [TikTokBotCapability.INSIGHTS]: 'Insights',
  [TikTokBotCapability.MENTIONS]: 'Mentions',
}

/** Capabilities in the order shown. */
export const TIKTOK_CAPABILITIES: readonly TikTokBotCapability[] = Object.values(TikTokBotCapability)

/** What the app's webhook categories are called; one the frontend does not know shows as it came. */
export const TIKTOK_WEBHOOK_LABELS: Readonly<Record<string, string>> = {
  DIRECT_MESSAGE: 'Direct messages',
  COMMENT: 'Comments',
  VIDEO: 'Post publishing',
  BRAND_MENTION: 'Mentions',
}

/** Counters in the order shown. */
export const TIKTOK_COUNTERS: readonly CounterItem<keyof TikTokBotCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'foreign', label: 'Other accounts' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'ignored', label: 'Ignored' },
]

/** How far ahead the panel warns that the authorization ends. */
export const REAUTHORIZE_WARNING_DAYS = 14

/** @returns whole days until the moment, negative when it passed */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.floor((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}
