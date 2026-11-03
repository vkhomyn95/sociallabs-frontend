// Mirrors of the backend's bot delivery types (credential/data/bot, integrations/telegram/bot/runtime) and of
// TelegramBotStatusResponse. Keep values in sync. Null fields are omitted from JSON, so they are optional here.

export enum BotDelivery {
  POLLING = 'POLLING',
  WEBHOOK = 'WEBHOOK',
}

/** What a bot's update delivery is doing. */
export enum BotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  CONFLICT = 'CONFLICT',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  WEBHOOK_FAILING = 'WEBHOOK_FAILING',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** Updates since delivery started in this server. */
export interface BotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  ignored: number
}

/** The bot's webhook as Telegram reports it. */
export interface BotWebhook {
  /** Empty when the bot is polled. */
  url: string
  pendingUpdates: number
  lastErrorAt?: string | null
  lastErrorMessage?: string | null
  maxConnections: number
  allowedUpdates: string[]
}

export interface TelegramBotStatus {
  delivery: BotDelivery
  status: BotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  /** Null when no trigger listens to the bot. */
  counters?: BotCounters | null
  knownChats: number
  /** Null when Telegram could not be asked; `webhookError` says why. */
  webhook?: BotWebhook | null
  webhookError?: string | null
}

/** What the last check of the token found out about the bot (credential metadata). */
export interface BotFacts {
  username: string | null
  botId: string | null
  canJoinGroups: boolean
  readsAllGroupMessages: boolean
  supportsInlineQueries: boolean
}
