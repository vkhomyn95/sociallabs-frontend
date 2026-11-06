// Mirrors of the backend's WhatsAppAccountState (integrations/whatsapp/account/runtime) and
// WhatsAppAccountStatusResponse. Keep values in sync. Null fields are omitted from JSON, so they are optional here.

/** What a linked account is doing. */
export enum WhatsAppAccountState {
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  RECONNECTING = 'RECONNECTING',
  LOGGED_OUT = 'LOGGED_OUT',
  BANNED = 'BANNED',
  CLOSED = 'CLOSED',
}

/** Updates since the account started in this server. */
export interface WhatsAppAccountCounters {
  received: number
  offline: number
  filtered: number
  handled: number
  dropped: number
  pending: number
  subscribers: number
}

export interface WhatsAppAccountStatusResponse {
  /** Whether the account runs on this server. */
  running: boolean
  state?: WhatsAppAccountState
  stateReason?: string
  stateChangedAt?: string
  phoneNumber?: string
  name?: string
  deviceName?: string
  counters?: WhatsAppAccountCounters
}
