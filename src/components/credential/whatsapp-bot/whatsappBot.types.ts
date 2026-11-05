// Mirrors of the backend's WhatsAppBotStatus (integrations/whatsapp/bot/runtime) and WhatsAppBotStatusResponse. Keep
// values in sync. Null fields are omitted from JSON, so they are optional here.

/** What a number's webhook delivery is doing. */
export enum WhatsAppBotStatus {
  STARTING = 'STARTING',
  READY = 'READY',
  NO_PUBLIC_URL = 'NO_PUBLIC_URL',
  NO_APP_SECRET = 'NO_APP_SECRET',
  TOKEN_INVALID = 'TOKEN_INVALID',
  WEBHOOK_UNVERIFIED = 'WEBHOOK_UNVERIFIED',
  WEBHOOK_CHANGED = 'WEBHOOK_CHANGED',
  UNREACHABLE = 'UNREACHABLE',
  CLOSED = 'CLOSED',
}

/** Meta's rating of the number's recent messages; a red number gets its limit lowered. */
export enum WhatsAppQualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN',
}

/** Webhooks since delivery started in this server. */
export interface WhatsAppBotCounters {
  received: number
  handled: number
  pending: number
  duplicates: number
  dropped: number
  foreign: number
}

/** Users the number heard from; `inWindow` ones may get free-form messages now. */
export interface WhatsAppBotContacts {
  seen: number
  inWindow: number
}

/** The number as Meta reports it. Meta sends values outside the enums too, so they stay strings. */
export interface WhatsAppBotNumber {
  displayPhoneNumber?: string | null
  verifiedName?: string | null
  qualityRating?: string | null
  messagingLimitTier?: string | null
  status?: string | null
  nameStatus?: string | null
}

/** Where Meta posts the number's webhooks: the number's override, else the business account's, else the app's. */
export interface WhatsAppBotWebhook {
  effective?: string | null
  /** Whether that is this server's address for the number. */
  here: boolean
  phoneNumber?: string | null
  businessAccount?: string | null
  application?: string | null
}

export interface WhatsAppBotStatusResponse {
  status: WhatsAppBotStatus
  statusMessage?: string | null
  statusChangedAt?: string | null
  /** Null when no trigger listens to the number. */
  counters?: WhatsAppBotCounters | null
  contacts: WhatsAppBotContacts
  /** Whether the server has the public HTTPS address Meta's webhooks need. */
  publicAddress: boolean
  /** Whether the credential has the app secret webhook signatures are checked with. */
  appSecret: boolean
  /** The address Meta should post to; null until a trigger first listened, or without a public address. */
  webhookUrl?: string | null
  /** The token Meta's check of the address presents, for setting it by hand in the App Dashboard. */
  verifyToken?: string | null
  /** Null when Meta could not be asked; `accountError` says why. */
  number?: WhatsAppBotNumber | null
  webhook?: WhatsAppBotWebhook | null
  accountError?: string | null
}
