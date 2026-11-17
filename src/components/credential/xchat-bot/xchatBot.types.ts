// Mirrors of the backend's XChatBotStatus (integrations/xchat/bot/runtime) and XChatBotStatusResponse. Keep values in
// sync. Null fields are omitted from JSON, so they are optional here.

/** What a bot's message delivery is doing. */
export enum XChatBotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  NO_PUBLIC_URL = 'NO_PUBLIC_URL',
  NO_APP_BEARER = 'NO_APP_BEARER',
  TOKEN_INVALID = 'TOKEN_INVALID',
  KEYS_MISSING = 'KEYS_MISSING',
  WEBHOOK_INVALID = 'WEBHOOK_INVALID',
  USAGE_CAPPED = 'USAGE_CAPPED',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** Webhook deliveries since delivery started in this server. */
export interface XChatBotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  ignored: number
  undecryptable: number
}

/** The bot's X account and its XChat key. */
export interface XChatBotAccount {
  userId: string
  username: string
  keyVersion: string
  /** Whether X still lists the bot's key on the account. */
  keysRegistered: boolean
}

export interface XChatBotStatusResponse {
  status: XChatBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  /** Null when no trigger listens to the bot in this server. */
  counters?: XChatBotCounters | null
  /** Whether the server has the public HTTPS address X's webhook needs. */
  publicAddress: boolean
  /** The address X posts to; null until a trigger first listened, or without a public address. */
  webhookUrl?: string | null
  /** The OAuth callback URL the X app must list; null without a public address. */
  callbackUrl?: string | null
  /** Whether the credential has the app's Bearer token, which receiving messages needs. */
  appBearer: boolean
  /** Null when X could not be asked; `accountError` says why. */
  account?: XChatBotAccount | null
  accountError?: string | null
}
