import type { SlbIconName } from '@sociallabs/frontend-components'
import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import type { MetaBotStatusLoader } from './metaBot.service'
import { MetaBotStatus, type MetaBotAccount, type MetaBotCounters } from './metaBot.types'

// Presentation of a Meta bot's delivery, shared by Instagram and Messenger. Records make a missing enum member a
// compile error.

export const META_STATUS_UI: Readonly<Record<MetaBotStatus, BotStatusUi>> = {
  [MetaBotStatus.STARTING]: {
    label: 'Starting',
    color: 'sky',
    hint: 'The account is checked and subscribed to the app’s webhooks',
  },
  [MetaBotStatus.READY]: { label: 'Receiving', color: 'success', hint: 'Webhooks arrive' },
  [MetaBotStatus.NO_PUBLIC_URL]: {
    label: 'No public address',
    color: 'error',
    hint: 'Meta delivers only by webhook, which needs the server’s public HTTPS address (app.public-url)',
  },
  [MetaBotStatus.NO_APP_SECRET]: {
    label: 'No app secret',
    color: 'error',
    hint: 'Add the app secret to the credential; webhook signatures cannot be checked without it',
  },
  [MetaBotStatus.TOKEN_INVALID]: {
    label: 'Token invalid',
    color: 'error',
    hint: 'Meta refuses the token; generate a new one in the Meta app and paste it into the credential',
  },
  [MetaBotStatus.TOKEN_EXPIRING]: {
    label: 'Token expiring',
    color: 'warning',
    hint: 'The token could not be renewed and expires soon; once expired it is dead for good',
  },
  [MetaBotStatus.WEBHOOK_UNVERIFIED]: {
    label: 'Set the webhook',
    color: 'warning',
    hint: 'Set the callback URL and verify token below in the Meta App Dashboard',
  },
  [MetaBotStatus.UNSUBSCRIBED]: {
    label: 'Not subscribed',
    color: 'warning',
    hint: 'The account does not send its webhooks to the app; the server subscribes it again every few minutes',
  },
  [MetaBotStatus.UNREACHABLE]: { label: 'Unreachable', color: 'warning', hint: 'Meta cannot be reached' },
  [MetaBotStatus.CLOSED]: { label: 'Idle', color: 'gray', hint: 'No active trigger listens to this bot' },
}

/** Counters in the order shown. */
export const META_COUNTERS: readonly CounterItem<keyof MetaBotCounters>[] = [
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

/** A note under the panel: what the platform allows. */
export interface MetaBotNote {
  readonly title: string
  readonly text: string
}

/** What one platform's panel shows around the shared parts. */
export interface MetaBotPlatformUi {
  /** The frame's title, e.g. `Account delivery`. */
  readonly title: string
  /** Shown when the status cannot be loaded. */
  readonly loadError: string
  readonly icon: SlbIconName
  readonly load: MetaBotStatusLoader
  /** How the account reads in one line, e.g. `@shop · The Shop`. */
  readonly accountLine: (account: MetaBotAccount) => string
  /** The steps in the Meta App Dashboard until Meta has checked the address. */
  readonly dashboardSteps: readonly string[]
  readonly notes: readonly MetaBotNote[]
}
