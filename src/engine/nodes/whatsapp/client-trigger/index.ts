import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * All webhook event fields from WhatsApp Cloud API.
 * Extends the base bot-trigger events with message-type filters
 * and additional client-specific controls.
 */
export enum WAClientTriggerEvent {
  MESSAGES                        = 'messages',
  ACCOUNT_REVIEW_UPDATE           = 'account_review_update',
  ACCOUNT_UPDATE                  = 'account_update',
  BUSINESS_CAPABILITY_UPDATE      = 'business_capability_update',
  MESSAGE_TEMPLATE_STATUS_UPDATE  = 'message_template_status_update',
  MESSAGE_TEMPLATE_QUALITY_UPDATE = 'message_template_quality_update',
  PHONE_NUMBER_NAME_UPDATE        = 'phone_number_name_update',
  PHONE_NUMBER_QUALITY_UPDATE     = 'phone_number_quality_update',
  SECURITY                        = 'security',
  TEMPLATE_CATEGORY_UPDATE        = 'template_category_update',
}

export enum WAClientIncomingMessageType {
  TEXT        = 'text',
  IMAGE       = 'image',
  AUDIO       = 'audio',
  VIDEO       = 'video',
  DOCUMENT    = 'document',
  STICKER     = 'sticker',
  LOCATION    = 'location',
  CONTACTS    = 'contacts',
  REACTION    = 'reaction',
  INTERACTIVE = 'interactive',   // button reply / list reply
  ORDER       = 'order',
  SYSTEM      = 'system',        // user changed number etc.
  UNKNOWN     = 'unknown',
}

export enum WAClientMessageStatus {
  SENT      = 'sent',
  DELIVERED = 'delivered',
  READ      = 'read',
  FAILED    = 'failed',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface WAClientTriggerParams {
  // Events to subscribe to
  triggerOn: WAClientTriggerEvent[]

  // Message sub-filters (only when 'messages' event is selected)
  filterMessageTypes: boolean
  messageTypes:       WAClientIncomingMessageType[]

  // Status sub-filter
  filterStatuses: boolean
  statuses:       WAClientMessageStatus[]

  // Phone number filter
  filterPhoneNumbers: boolean
  phoneNumberIds:     string   // comma-separated Phone Number IDs to watch

  // Sender filter
  filterSenders: boolean
  senderPhones:  string   // comma-separated phone numbers

  // Auto-download
  downloadImages:    boolean
  downloadVideos:    boolean
  downloadAudio:     boolean
  downloadDocuments: boolean

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultWAClientTriggerParams(): WAClientTriggerParams {
  return {
    triggerOn:          [WAClientTriggerEvent.MESSAGES],
    filterMessageTypes: false,
    messageTypes:       [],
    filterStatuses:     false,
    statuses:           [],
    filterPhoneNumbers: false,
    phoneNumberIds:     '',
    filterSenders:      false,
    senderPhones:       '',
    downloadImages:     false,
    downloadVideos:     false,
    downloadAudio:      false,
    downloadDocuments:  false,
    continueOnFail:     false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const WA_CLIENT_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '💬 Messages',                       value: WAClientTriggerEvent.MESSAGES                       },
  { label: '🔍 Account Review Update',           value: WAClientTriggerEvent.ACCOUNT_REVIEW_UPDATE          },
  { label: '⚙️ Account Update',                  value: WAClientTriggerEvent.ACCOUNT_UPDATE                 },
  { label: '🏢 Business Capability Update',      value: WAClientTriggerEvent.BUSINESS_CAPABILITY_UPDATE     },
  { label: '📋 Message Template Status Update',  value: WAClientTriggerEvent.MESSAGE_TEMPLATE_STATUS_UPDATE },
  { label: '📊 Message Template Quality Update', value: WAClientTriggerEvent.MESSAGE_TEMPLATE_QUALITY_UPDATE},
  { label: '📝 Phone Number Name Update',        value: WAClientTriggerEvent.PHONE_NUMBER_NAME_UPDATE       },
  { label: '📶 Phone Number Quality Update',     value: WAClientTriggerEvent.PHONE_NUMBER_QUALITY_UPDATE    },
  { label: '🔐 Security',                        value: WAClientTriggerEvent.SECURITY                       },
  { label: '🏷️ Template Category Update',        value: WAClientTriggerEvent.TEMPLATE_CATEGORY_UPDATE       },
]

export const WA_CLIENT_TRIGGER_EVENT_DESCRIPTIONS: Record<WAClientTriggerEvent, string> = {
  [WAClientTriggerEvent.MESSAGES]:
    'Fires on any incoming message, delivery receipt, or read status update',
  [WAClientTriggerEvent.ACCOUNT_REVIEW_UPDATE]:
    'Triggers when your business account review status changes',
  [WAClientTriggerEvent.ACCOUNT_UPDATE]:
    'Monitors changes to your WhatsApp Business account settings',
  [WAClientTriggerEvent.BUSINESS_CAPABILITY_UPDATE]:
    'Detects when features are enabled or disabled on your account',
  [WAClientTriggerEvent.MESSAGE_TEMPLATE_STATUS_UPDATE]:
    'Alerts when a template is approved, rejected, or paused',
  [WAClientTriggerEvent.MESSAGE_TEMPLATE_QUALITY_UPDATE]:
    'Notifies of changes to your template quality score',
  [WAClientTriggerEvent.PHONE_NUMBER_NAME_UPDATE]:
    'Fires when your WhatsApp display name is updated or under review',
  [WAClientTriggerEvent.PHONE_NUMBER_QUALITY_UPDATE]:
    'Monitors phone number quality rating changes',
  [WAClientTriggerEvent.SECURITY]:
    'Triggers on security-related events (e.g. client session changes)',
  [WAClientTriggerEvent.TEMPLATE_CATEGORY_UPDATE]:
    'Detects when a template category is changed by WhatsApp',
}

export const WA_CLIENT_MSG_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',        value: WAClientIncomingMessageType.TEXT        },
  { label: 'Image',       value: WAClientIncomingMessageType.IMAGE       },
  { label: 'Audio',       value: WAClientIncomingMessageType.AUDIO       },
  { label: 'Video',       value: WAClientIncomingMessageType.VIDEO       },
  { label: 'Document',    value: WAClientIncomingMessageType.DOCUMENT    },
  { label: 'Sticker',     value: WAClientIncomingMessageType.STICKER     },
  { label: 'Location',    value: WAClientIncomingMessageType.LOCATION    },
  { label: 'Contacts',    value: WAClientIncomingMessageType.CONTACTS    },
  { label: 'Reaction',    value: WAClientIncomingMessageType.REACTION    },
  { label: 'Interactive', value: WAClientIncomingMessageType.INTERACTIVE },
  { label: 'Order',       value: WAClientIncomingMessageType.ORDER       },
  { label: 'System',      value: WAClientIncomingMessageType.SYSTEM      },
  { label: 'Unknown',     value: WAClientIncomingMessageType.UNKNOWN     },
]

export const WA_CLIENT_STATUS_OPTIONS: SelectOption[] = [
  { label: '📤 Sent',      value: WAClientMessageStatus.SENT      },
  { label: '📬 Delivered', value: WAClientMessageStatus.DELIVERED },
  { label: '👁️ Read',      value: WAClientMessageStatus.READ      },
  { label: '❌ Failed',    value: WAClientMessageStatus.FAILED    },
]
