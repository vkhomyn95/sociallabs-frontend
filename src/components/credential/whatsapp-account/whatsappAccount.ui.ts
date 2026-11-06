import type { BotStatusUi, CounterItem } from '../bot-common/botPanel'
import { WhatsAppAccountState, type WhatsAppAccountCounters } from './whatsappAccount.types'

// Presentation of a linked account. Records make a missing enum member a compile error.

export const ACCOUNT_STATE_UI: Readonly<Record<WhatsAppAccountState, BotStatusUi>> = {
  [WhatsAppAccountState.CONNECTING]: { label: 'Connecting', color: 'sky', hint: 'Connecting to WhatsApp' },
  [WhatsAppAccountState.READY]: { label: 'Connected', color: 'success', hint: 'Messages arrive and can be sent' },
  [WhatsAppAccountState.RECONNECTING]: {
    label: 'Reconnecting',
    color: 'warning',
    hint: 'The connection dropped; it comes back by itself',
  },
  [WhatsAppAccountState.LOGGED_OUT]: {
    label: 'Unlinked',
    color: 'error',
    hint: 'The device was removed under Linked devices on the phone; connect the account again',
  },
  [WhatsAppAccountState.BANNED]: { label: 'Banned', color: 'error', hint: 'WhatsApp banned the account' },
  [WhatsAppAccountState.CLOSED]: { label: 'Stopped', color: 'gray', hint: 'The account is not connected; reconnect it' },
}

/** How an account that does not run on this server shows. */
export const NOT_RUNNING_UI: BotStatusUi = {
  label: 'Not running',
  color: 'gray',
  hint: 'The account did not start on this server; reconnect it',
}

/** States a reconnect helps: the account is stopped or not running. Unlinked and banned ones must be linked again. */
export const RECONNECTABLE: ReadonlySet<WhatsAppAccountState> = new Set([WhatsAppAccountState.CLOSED])

export const ACCOUNT_COUNTERS: readonly CounterItem<keyof WhatsAppAccountCounters>[] = [
  { key: 'received', label: 'Received' },
  { key: 'offline', label: 'From backlog' },
  { key: 'handled', label: 'Handled' },
  { key: 'filtered', label: 'Not wanted' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'pending', label: 'Waiting' },
  { key: 'subscribers', label: 'Listening' },
]
