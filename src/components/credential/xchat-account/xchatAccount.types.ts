// Mirrors of the backend's XChatAccountState (integrations/xchat/account/runtime) and XChatAccountStatusResponse.
// Keep values in sync. Null fields are omitted from JSON, so they are optional here.

/** What a connected X account is doing in XChat. */
export enum XChatAccountState {
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  RECONNECTING = 'RECONNECTING',
  RATE_LIMITED = 'RATE_LIMITED',
  SHIM_UNAVAILABLE = 'SHIM_UNAVAILABLE',
  XCHAT_LOCKED = 'XCHAT_LOCKED',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

/** Updates since the account started in this server. */
export interface XChatAccountCounters {
  received: number
  filtered: number
  handled: number
  dropped: number
  pending: number
  subscribers: number
}

export interface XChatAccountStatusResponse {
  /** Whether the account runs on this server. */
  running: boolean
  state?: XChatAccountState
  stateReason?: string
  stateChangedAt?: string
  /** Whether only connecting the account again (a new browser session, the PIN) brings it back. */
  needsReconnect: boolean
  /** `@username` without the at sign, as when the account was connected. */
  username?: string
  name?: string
  /** When the shim last delivered something of the account. */
  lastEventAt?: string
  /** End of the pause after X throttled the account. */
  pausedUntil?: string
  counters?: XChatAccountCounters
}
