// Mirrors of the backend's ViberBotStatus (integrations/viber/bot/runtime) and ViberBotStatusResponse. Keep values in
// sync. Null fields are omitted from JSON, so they are optional here.

/** What a bot's callback delivery is doing. */
export enum ViberBotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  WEBHOOK_FAILING = 'WEBHOOK_FAILING',
  WEBHOOK_CHANGED = 'WEBHOOK_CHANGED',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** Callbacks since delivery started in this server. */
export interface ViberBotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  ignored: number
  welcomed: number
}

/** Users the bot has seen; `subscribed` ones it may write to first. */
export interface ViberBotSubscribers {
  seen: number
  subscribed: number
}

/** The bot as Viber reports it (`get_account_info`). */
export interface ViberBotAccount {
  id: string
  name: string
  uri?: string | null
  icon?: string | null
  country?: string | null
  /** Empty when no webhook is set. */
  webhook: string
  /** Whether the webhook points at this server's address for the bot. */
  webhookHere: boolean
  eventTypes: string[]
  subscribersCount: number
}

export interface ViberBotStatusResponse {
  status: ViberBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  /** Null when no trigger listens to the bot. */
  counters?: ViberBotCounters | null
  subscribers: ViberBotSubscribers
  /** Whether the server has the public HTTPS address Viber's webhook needs. */
  publicAddress: boolean
  /** The address Viber should call; null until a trigger first listened, or without a public address. */
  webhookUrl?: string | null
  /** Null when Viber could not be asked; `accountError` says why. */
  account?: ViberBotAccount | null
  accountError?: string | null
}
