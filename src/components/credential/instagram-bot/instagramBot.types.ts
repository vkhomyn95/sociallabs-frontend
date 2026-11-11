// Mirrors of the backend's InstagramBotStatus (integrations/instagram/bot/runtime) and InstagramBotStatusResponse. Keep
// values in sync. Null fields are omitted from JSON, so they are optional here.

/** What an account's webhook delivery is doing. */
export enum InstagramBotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  NO_PUBLIC_URL = 'NO_PUBLIC_URL',
  NO_APP_SECRET = 'NO_APP_SECRET',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRING = 'TOKEN_EXPIRING',
  WEBHOOK_UNVERIFIED = 'WEBHOOK_UNVERIFIED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** Webhook updates since delivery started in this server. */
export interface InstagramBotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  foreign: number
}

/** Users the account heard from in Direct; `inWindow` ones may be answered now. */
export interface InstagramBotContacts {
  seen: number
  inWindow: number
}

/** The long-lived token's expiry, as far as this server knows (it learns it at the first renewal). */
export interface InstagramBotToken {
  expiresAt?: string | null
  renewedAt?: string | null
}

/** The professional account as Instagram reports it; the type stays a string, Instagram may add values. */
export interface InstagramBotAccount {
  userId?: string | null
  username?: string | null
  name?: string | null
  accountType?: string | null
}

/** Whether the account sends its webhooks to the credential's Meta app, and which fields. */
export interface InstagramBotSubscription {
  subscribed: boolean
  fields: string[]
}

export interface InstagramBotStatusResponse {
  status: InstagramBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  counters?: InstagramBotCounters | null
  contacts: InstagramBotContacts
  publicAddress: boolean
  appSecret: boolean
  webhookUrl?: string | null
  verifyToken?: string | null
  webhookVerified: boolean
  token: InstagramBotToken
  account?: InstagramBotAccount | null
  subscription?: InstagramBotSubscription | null
  accountError?: string | null
}
