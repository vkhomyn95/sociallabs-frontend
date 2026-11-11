import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { InstagramBotStatus, type InstagramBotCounters } from './instagramBot.types'

// Presentation of the account's delivery. Records make a missing enum member a compile error.

export const INSTAGRAM_STATUS_UI: Readonly<Record<InstagramBotStatus, BotStatusUi>> = {
  [InstagramBotStatus.STARTING]: {
    label: 'Starting',
    color: 'sky',
    hint: 'The account is checked and subscribed to the app’s webhooks',
  },
  [InstagramBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Webhooks arrive' },
  [InstagramBotStatus.NO_PUBLIC_URL]: {
    label: 'No public address',
    color: 'error',
    hint: 'Meta delivers only by webhook, which needs the server’s public HTTPS address (app.public-url)',
  },
  [InstagramBotStatus.NO_APP_SECRET]: {
    label: 'No app secret',
    color: 'error',
    hint: 'Add the app secret to the credential; webhook signatures cannot be checked without it',
  },
  [InstagramBotStatus.TOKEN_INVALID]: {
    label: 'Token invalid',
    color: 'error',
    hint: 'Instagram refuses the token; generate a new one in the Meta app and paste it into the credential',
  },
  [InstagramBotStatus.TOKEN_EXPIRING]: {
    label: 'Token expiring',
    color: 'warning',
    hint: 'The token could not be renewed and expires soon; once expired it is dead for good',
  },
  [InstagramBotStatus.WEBHOOK_UNVERIFIED]: {
    label: 'Set the webhook',
    color: 'warning',
    hint: 'Set the callback URL and verify token below in the Meta App Dashboard',
  },
  [InstagramBotStatus.UNSUBSCRIBED]: {
    label: 'Not subscribed',
    color: 'warning',
    hint: 'The account does not send its webhooks to the app; the server subscribes it again every few minutes',
  },
  [InstagramBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'Instagram cannot be reached' },
  [InstagramBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this account' },
}

/** Counters in the order shown. */
export const INSTAGRAM_COUNTERS: readonly CounterItem<keyof InstagramBotCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'pending', label: 'Queued' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'foreign', label: 'Other accounts' },
]

/** A token with less than this left shows as expiring, whatever the status says. */
const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000

/** @returns whether the token expires within a week of `now` */
export function tokenExpiresSoon(expiresAt: string | null | undefined, now: number = Date.now()): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() - now < EXPIRING_SOON_MS
}

/** The steps in the Meta App Dashboard, mode A of ADR-0019: the customer's own app. */
export const DASHBOARD_STEPS: readonly string[] = [
  'In the Meta App Dashboard, open your app → Instagram → API setup with Instagram login.',
  'Under “Configure webhooks”, paste the callback URL and verify token below and press “Verify and save”.',
  'Subscribe the fields: messages, messaging_postbacks, messaging_seen, message_reactions, messaging_referral, comments.',
  'Switch the app to Live: Meta delivers webhooks of users only to a live app.',
]
