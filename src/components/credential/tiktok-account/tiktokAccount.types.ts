// Mirrors of the backend's TikTokAccountState (integrations/tiktok/account/runtime) and TikTokAccountStatusResponse.
// Keep values in sync. Null fields are omitted from JSON, so they are optional here.

/** What a connected account is doing. */
export enum TikTokAccountState {
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  RECONNECTING = 'RECONNECTING',
  RATE_LIMITED = 'RATE_LIMITED',
  SIGNATURE_REJECTED = 'SIGNATURE_REJECTED',
  SHIM_UNAVAILABLE = 'SHIM_UNAVAILABLE',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  CLOSED = 'CLOSED',
}

/** Updates since the account started in this server. */
export interface TikTokAccountCounters {
  received: number
  filtered: number
  handled: number
  dropped: number
  pending: number
  subscribers: number
}

export interface TikTokAccountStatusResponse {
  /** Whether the account runs on this server. */
  running: boolean
  state?: TikTokAccountState
  stateReason?: string
  stateChangedAt?: string
  /** `@username` without the at sign, as when the account was connected. */
  username?: string
  nickname?: string
  /** When the shim last delivered something of the account. */
  lastEventAt?: string
  /** End of the pause after TikTok restricted the account. */
  pausedUntil?: string
  counters?: TikTokAccountCounters
}
