import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { TikTokAccountState, type TikTokAccountCounters } from './tiktokAccount.types'

// Presentation of a connected TikTok account. Records make a missing enum member a compile error.

export const ACCOUNT_STATE_UI: Readonly<Record<TikTokAccountState, BotStatusUi>> = {
  [TikTokAccountState.CONNECTING]: { label: 'Connecting', color: 'sky', hint: 'Connecting to TikTok' },
  [TikTokAccountState.READY]: { label: 'Connected', color: 'success', hint: 'Messages arrive and can be sent' },
  [TikTokAccountState.RECONNECTING]: {
    label: 'Reconnecting',
    color: 'warning',
    hint: 'The shim lost TikTok and connects again by itself',
  },
  [TikTokAccountState.RATE_LIMITED]: {
    label: 'Rate limited',
    color: 'warning',
    hint: 'TikTok restricts the account for now; every workflow waits until the pause ends',
  },
  [TikTokAccountState.SIGNATURE_REJECTED]: {
    label: 'Signatures rejected',
    color: 'error',
    hint: 'TikTok no longer accepts the shim’s requests; the TikTok shim needs an update',
  },
  [TikTokAccountState.SHIM_UNAVAILABLE]: {
    label: 'Shim unavailable',
    color: 'error',
    hint: 'The TikTok shim cannot be reached; the account comes back when the shim does',
  },
  [TikTokAccountState.LOGIN_REQUIRED]: {
    label: 'Login required',
    color: 'error',
    hint: 'The TikTok session ended (logged out or expired); connect the account again',
  },
  [TikTokAccountState.CLOSED]: { label: 'Stopped', color: 'gray', hint: 'The account is not connected; reconnect it' },
}

/** How an account that does not run on this server shows. */
export const NOT_RUNNING_UI: BotStatusUi = {
  label: 'Not running',
  color: 'gray',
  hint: 'The account did not start on this server; reconnect it',
}

/**
 * States a reconnect helps: a stopped account is attached again, a stuck one restarted in the shim. An ended session
 * must be connected again; a connected or connecting one needs nothing.
 */
export const RECONNECTABLE: ReadonlySet<TikTokAccountState> = new Set([
  TikTokAccountState.CLOSED,
  TikTokAccountState.RECONNECTING,
  TikTokAccountState.RATE_LIMITED,
  TikTokAccountState.SIGNATURE_REJECTED,
  TikTokAccountState.SHIM_UNAVAILABLE,
])

export const ACCOUNT_COUNTERS: readonly CounterItem<keyof TikTokAccountCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'filtered', label: 'Not wanted' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'pending', label: 'Waiting' },
  { key: 'subscribers', label: 'Listening' },
]
