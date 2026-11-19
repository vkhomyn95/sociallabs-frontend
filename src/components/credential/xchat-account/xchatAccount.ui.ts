import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { XChatAccountState, type XChatAccountCounters } from './xchatAccount.types'

// Presentation of a connected X account in XChat. Records make a missing enum member a compile error.

export const ACCOUNT_STATE_UI: Readonly<Record<XChatAccountState, BotStatusUi>> = {
  [XChatAccountState.CONNECTING]: { label: 'Connecting', color: 'sky', hint: 'Connecting to XChat' },
  [XChatAccountState.READY]: { label: 'Connected', color: 'success', hint: 'Messages arrive and can be sent' },
  [XChatAccountState.RECONNECTING]: {
    label: 'Reconnecting',
    color: 'warning',
    hint: 'The shim lost XChat and connects again by itself, then fetches what it missed',
  },
  [XChatAccountState.RATE_LIMITED]: {
    label: 'Rate limited',
    color: 'warning',
    hint: 'X throttles the account for now; every workflow waits until the pause ends',
  },
  [XChatAccountState.SHIM_UNAVAILABLE]: {
    label: 'Shim unavailable',
    color: 'error',
    hint: 'The XChat shim cannot be reached; the account comes back when the shim does',
  },
  [XChatAccountState.XCHAT_LOCKED]: {
    label: 'XChat locked',
    color: 'error',
    hint: 'X no longer accepts the stored XChat keys; connect the account again with its PIN',
  },
  [XChatAccountState.LOGIN_REQUIRED]: {
    label: 'Login required',
    color: 'error',
    hint: 'The X session ended (logged out or expired); connect the account again',
  },
  [XChatAccountState.SUSPENDED]: {
    label: 'Restricted by X',
    color: 'error',
    hint: 'X restricted or suspended the account',
  },
  [XChatAccountState.CLOSED]: { label: 'Stopped', color: 'gray', hint: 'The account is not connected; reconnect it' },
}

/** How an account that does not run on this server shows. */
export const NOT_RUNNING_UI: BotStatusUi = {
  label: 'Not running',
  color: 'gray',
  hint: 'The account did not start on this server; reconnect it',
}

/**
 * States a reconnect helps: a stopped account is attached again, a stuck one restarted in the shim. An ended session,
 * rejected keys or a restriction need a new connection; a connected or connecting one needs nothing.
 */
export const RECONNECTABLE: ReadonlySet<XChatAccountState> = new Set([
  XChatAccountState.CLOSED,
  XChatAccountState.RECONNECTING,
  XChatAccountState.RATE_LIMITED,
  XChatAccountState.SHIM_UNAVAILABLE,
])

/** What to do when only a new connection helps, by the state that says so. */
export const CONNECT_AGAIN: Readonly<Partial<Record<XChatAccountState, { title: string; text: string }>>> = {
  [XChatAccountState.LOGIN_REQUIRED]: {
    title: 'Log in again',
    text: 'X ended this session (it was logged out in the browser it came from, or it expired). Connect the account '
      + 'again with a fresh auth_token cookie and its PIN, then delete this credential and pick the new one in the '
      + 'workflows.',
  },
  [XChatAccountState.XCHAT_LOCKED]: {
    title: 'Enter the PIN again',
    text: 'X no longer accepts the XChat keys stored for this account (the PIN was changed or the keys reset in the X '
      + 'app). Connect the account again with its current PIN, then delete this credential and pick the new one in '
      + 'the workflows.',
  },
  [XChatAccountState.SUSPENDED]: {
    title: 'Restricted by X',
    text: 'X restricted or suspended this account, so it cannot send or receive. Check the account in the X app; once '
      + 'X lifts the restriction, connect it again.',
  },
}

export const ACCOUNT_COUNTERS: readonly CounterItem<keyof XChatAccountCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'handled', label: 'Handled' },
  { key: 'filtered', label: 'Not wanted' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'pending', label: 'Waiting' },
  { key: 'subscribers', label: 'Listening' },
]
