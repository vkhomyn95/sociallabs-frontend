// Mirrors of the backend's TikTokBotStatus (integrations/tiktok/bot/runtime), TikTokBotCapability
// (integrations/tiktok/bot/account), TikTokBotStatusResponse and TikTokBotSetupResponse. Keep values in sync. Null
// fields are omitted from JSON, so they are optional here.

/** What a bot's event delivery is doing. */
export enum TikTokBotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  REAUTHORIZE_SOON = 'REAUTHORIZE_SOON',
  NO_PUBLIC_URL = 'NO_PUBLIC_URL',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NO_MESSAGING_ACCESS = 'NO_MESSAGING_ACCESS',
  WEBHOOK_FOREIGN = 'WEBHOOK_FOREIGN',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** What a bot's account can do, by the scopes its owner granted. */
export enum TikTokBotCapability {
  MESSAGING = 'MESSAGING',
  COMMENTS = 'COMMENTS',
  PUBLISHING = 'PUBLISHING',
  INSIGHTS = 'INSIGHTS',
  MENTIONS = 'MENTIONS',
}

/** Webhook deliveries of the bot's developer app since delivery started in this server. */
export interface TikTokBotCounters {
  bots: number
  received: number
  handled: number
  pending: number
  duplicates: number
  foreign: number
  dropped: number
  ignored: number
}

/** The app's URL prefix TikTok downloads published item files from. */
export interface TikTokBotMedia {
  prefix: string
  verified: boolean
}

/** The account as TikTok reports it now. */
export interface TikTokBotAccount {
  openId: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  /** Advanced Access or a Verified Business Account, which direct messages need. */
  messagingAccount: boolean
  capabilities: TikTokBotCapability[]
  /** What each other capability lacks: scopes, or an account kind. */
  missing: Partial<Record<TikTokBotCapability, string[]>>
}

/** A person who wrote to the bot. */
export interface TikTokBotContact {
  username?: string | null
  conversationId?: string | null
  isFollower?: boolean | null
  lastInboundAt: string
  windowOpen: boolean
  sentSince: number
}

export interface TikTokBotStatusResponse {
  status: TikTokBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  /** Null when the bot does not receive events in this server. */
  counters?: TikTokBotCounters | null
  /** Whether the server has the public HTTPS address, without a port, TikTok needs. */
  publicAddress: boolean
  /** The redirect URL the TikTok app must list; null without a public address. */
  callbackUrl?: string | null
  /** Where the app's webhook posts; null until a trigger first listened. */
  webhookUrl?: string | null
  /** Webhook categories configured for the app (DIRECT_MESSAGE, COMMENT, VIDEO, BRAND_MENTION). */
  webhookTypes: string[]
  /** Whether the owner allowed replacing the app's webhook when it points elsewhere. */
  replaceForeignCallback: boolean
  /** Null until something was published from a file. */
  media?: TikTokBotMedia | null
  /** When the owner must authorize the account again. */
  reauthorizeBy: string
  /** Null when TikTok could not be asked; `accountError` says why. */
  account?: TikTokBotAccount | null
  accountError?: string | null
  contacts: TikTokBotContact[]
}

/** What a TikTok app needs before a bot is connected. */
export interface TikTokBotSetupResponse {
  publicAddress: boolean
  /** The redirect URL the app must list; null without a public address. */
  callbackUrl?: string | null
  /** app.public-url as configured; null when unset. */
  configuredUrl?: string | null
}
