import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Messenger Platform webhook subscription fields.
 * Source: Meta Messenger Platform Webhook Reference.
 */
export enum MessengerTriggerEvent {
  // Core messaging events
  MESSAGES             = 'messages',
  MESSAGING_POSTBACKS  = 'messaging_postbacks',
  MESSAGING_OPTINS     = 'messaging_optins',
  MESSAGING_REFERRALS  = 'messaging_referrals',
  // Status events
  MESSAGE_DELIVERIES   = 'message_deliveries',
  MESSAGE_READS        = 'message_reads',
  MESSAGE_ECHOES       = 'message_echoes',
  // Handover protocol
  MESSAGING_HANDOVERS  = 'messaging_handovers',
  // Reactions
  MESSAGING_REACTIONS  = 'messaging_reactions',
  // Customer information
  MESSAGING_CUSTOMER_INFORMATION = 'messaging_customer_information',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface MessengerTriggerParams {
  // Page to subscribe to
  pageId: string

  // Webhook events
  triggerOn: MessengerTriggerEvent[]

  // Options
  includeValues: boolean   // include the full value object in change payloads

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultMessengerTriggerParams(): MessengerTriggerParams {
  return {
    pageId:         '',
    triggerOn:      [MessengerTriggerEvent.MESSAGES],
    includeValues:  true,
    continueOnFail: false,
  }
}

// ─── Event options + descriptions ─────────────────────────────────────────────

export const MESSENGER_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '💬 Messages',                    value: MessengerTriggerEvent.MESSAGES                       },
  { label: '🔘 Messaging Postbacks',          value: MessengerTriggerEvent.MESSAGING_POSTBACKS            },
  { label: '✅ Messaging Opt-Ins',            value: MessengerTriggerEvent.MESSAGING_OPTINS               },
  { label: '🔗 Messaging Referrals',          value: MessengerTriggerEvent.MESSAGING_REFERRALS            },
  { label: '📬 Message Deliveries',           value: MessengerTriggerEvent.MESSAGE_DELIVERIES             },
  { label: '👁️ Message Reads',               value: MessengerTriggerEvent.MESSAGE_READS                  },
  { label: '🔁 Message Echoes',               value: MessengerTriggerEvent.MESSAGE_ECHOES                 },
  { label: '🤝 Messaging Handovers',          value: MessengerTriggerEvent.MESSAGING_HANDOVERS            },
  { label: '❤️ Messaging Reactions',          value: MessengerTriggerEvent.MESSAGING_REACTIONS            },
  { label: '👤 Customer Information',         value: MessengerTriggerEvent.MESSAGING_CUSTOMER_INFORMATION },
]

export const MESSENGER_TRIGGER_EVENT_DESCRIPTIONS: Record<MessengerTriggerEvent, string> = {
  [MessengerTriggerEvent.MESSAGES]:
    'Fires when a user sends a message to your Page (text, attachments, quick reply responses)',
  [MessengerTriggerEvent.MESSAGING_POSTBACKS]:
    'Fires when a user taps a Postback button, Get Started button, or Persistent Menu item',
  [MessengerTriggerEvent.MESSAGING_OPTINS]:
    'Fires when a user opts in to receive messages via the Send-to-Messenger plugin or checkbox plugin',
  [MessengerTriggerEvent.MESSAGING_REFERRALS]:
    'Fires when a user comes from an m.me link with a ref parameter, or a Messenger ad',
  [MessengerTriggerEvent.MESSAGE_DELIVERIES]:
    'Fires when a message sent by your Page is delivered to a user',
  [MessengerTriggerEvent.MESSAGE_READS]:
    'Fires when a user reads a message sent by your Page',
  [MessengerTriggerEvent.MESSAGE_ECHOES]:
    'Fires when your Page sends a message (allows mirroring sent messages to the webhook)',
  [MessengerTriggerEvent.MESSAGING_HANDOVERS]:
    'Fires on handover protocol events (pass thread control, take thread control, request thread control)',
  [MessengerTriggerEvent.MESSAGING_REACTIONS]:
    'Fires when a user reacts to a message sent by your Page',
  [MessengerTriggerEvent.MESSAGING_CUSTOMER_INFORMATION]:
    'Fires when customer contact info is received (requires Customer Information permission)',
}
