import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Mandatory events (always received, cannot be filtered):
 *   message, subscribed, unsubscribed
 *
 * Optional events (can be filtered via event_types):
 *   delivered, seen, failed, conversation_started
 */
export enum ViberBotTriggerEvent {
  // Mandatory
  MESSAGE              = 'message',
  SUBSCRIBED           = 'subscribed',
  UNSUBSCRIBED         = 'unsubscribed',
  // Optional
  DELIVERED            = 'delivered',
  SEEN                 = 'seen',
  FAILED               = 'failed',
  CONVERSATION_STARTED = 'conversation_started',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface ViberBotTriggerParams {
  // Webhook event filter
  // Mandatory events are always on; optionals are selectable
  eventDelivered:           boolean
  eventSeen:                boolean
  eventFailed:              boolean
  eventConversationStarted: boolean

  // User data in callbacks
  sendName:  boolean
  sendPhoto: boolean

  // Downloads
  downloadImages:    boolean
  downloadVideos:    boolean
  downloadFiles:     boolean
  downloadVoice:     boolean

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultViberBotTriggerParams(): ViberBotTriggerParams {
  return {
    eventDelivered:           false,
    eventSeen:                false,
    eventFailed:              false,
    eventConversationStarted: true,
    sendName:                 true,
    sendPhoto:                false,
    downloadImages:           false,
    downloadVideos:           false,
    downloadFiles:            false,
    downloadVoice:            false,
    continueOnFail:           false,
  }
}

// ─── Info ─────────────────────────────────────────────────────────────────────

export const MANDATORY_EVENTS = [
  ViberBotTriggerEvent.MESSAGE,
  ViberBotTriggerEvent.SUBSCRIBED,
  ViberBotTriggerEvent.UNSUBSCRIBED,
]

export const OPTIONAL_EVENTS_LABELS: Record<string, string> = {
  eventDelivered:           'Delivered — when message is delivered to the device',
  eventSeen:                'Seen — when conversation is opened (once per read)',
  eventFailed:              'Failed — when message delivery fails',
  eventConversationStarted: 'Conversation Started — when user opens the bot for the first time',
}
