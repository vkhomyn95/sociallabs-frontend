// Mirrors of the backend's MetaBotStatus (integrations/meta/messaging/status) and MetaBotStatusResponse. Keep values in
// sync. Null fields are omitted from JSON, so they are optional here.

/** What a Meta bot's webhook delivery is doing. */
export enum MetaBotStatus {
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
export interface MetaBotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  foreign: number
}

/** Users the bot heard from; `inWindow` ones may be answered now. */
export interface MetaBotContacts {
  seen: number
  inWindow: number
}

/** The token's expiry, as far as this server knows; absent where tokens do not expire (a page token). */
export interface MetaBotToken {
  expiresAt?: string | null
  renewedAt?: string | null
}

/** The account as Meta reports it: an Instagram account (handle, account type) or a page (name, category). */
export interface MetaBotAccount {
  id?: string | null
  username?: string | null
  name?: string | null
  type?: string | null
}

/** Whether the account sends its webhooks to the credential's Meta app, and which fields. */
export interface MetaBotSubscription {
  subscribed: boolean
  fields: string[]
}

export interface MetaBotStatusResponse {
  status: MetaBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  counters?: MetaBotCounters | null
  contacts: MetaBotContacts
  publicAddress: boolean
  appSecret: boolean
  webhookUrl?: string | null
  verifyToken?: string | null
  webhookVerified: boolean
  token?: MetaBotToken | null
  account?: MetaBotAccount | null
  subscription?: MetaBotSubscription | null
  accountError?: string | null
}
