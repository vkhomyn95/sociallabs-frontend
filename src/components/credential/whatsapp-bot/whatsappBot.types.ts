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

// Mirrors of the backend's template enums (integrations/whatsapp/bot/api/model/template) and
// WhatsAppTemplateStructureResponse.

/** What a template's header shows. */
export enum TemplateHeaderFormat {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
}

/** The kinds of buttons a template may have. */
export enum TemplateButtonType {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  COPY_CODE = 'COPY_CODE',
  OTP = 'OTP',
  FLOW = 'FLOW',
}

/** The kinds of values a template button is sent with; also the button types of the node's "Button variables". */
export enum TemplateButtonKind {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  COPY_CODE = 'COPY_CODE',
  FLOW = 'FLOW',
}

/** How a template's variables are written: {{1}} filled in order, or {{first_name}} filled by name. */
export enum TemplateParameterFormat {
  POSITIONAL = 'POSITIONAL',
  NAMED = 'NAMED',
}

export interface TemplateHeaderStructure {
  format: TemplateHeaderFormat
  text?: string
  /** The name of the text's variable ("1" for {{1}}); absent when it has none. */
  variable?: string
  /** Whether a value is sent for it: media and locations always, a text only with a variable. */
  needsValue: boolean
}

export interface TemplateButtonStructure {
  /** The button's position, from 0. */
  index: number
  type: TemplateButtonType
  text?: string
  url?: string
  /** The kind of value it is sent with; absent when it takes none. */
  valueKind?: TemplateButtonKind
  valueRequired: boolean
}

/** One language of a template. */
export interface TemplateLanguageStructure {
  id?: string
  language: string
  status?: string
  approved: boolean
  category?: string
  parameterFormat: TemplateParameterFormat
  header?: TemplateHeaderStructure
  body: { text?: string; variables: string[] }
  footer?: string
  buttons: TemplateButtonStructure[]
}

export interface WhatsAppTemplateStructureResponse {
  name: string
  /** Empty when the business account has no template of that name. */
  languages: TemplateLanguageStructure[]
  /** Why Meta could not be asked. */
  error?: string
}
