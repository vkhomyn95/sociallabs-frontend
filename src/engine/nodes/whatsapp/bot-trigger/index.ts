import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * All trigger event types from n8n WhatsApp Trigger node.
 * Source: Meta WhatsApp Business Platform webhook fields.
 */
export enum WhatsAppTriggerEvent {
  // Core message events
  MESSAGES                       = 'messages',
  // Account management events
  ACCOUNT_REVIEW_UPDATE          = 'account_review_update',
  ACCOUNT_UPDATE                 = 'account_update',
  BUSINESS_CAPABILITY_UPDATE     = 'business_capability_update',
  // Template events
  MESSAGE_TEMPLATE_STATUS_UPDATE = 'message_template_status_update',
  MESSAGE_TEMPLATE_QUALITY_UPDATE = 'message_template_quality_update',
  // Phone number events
  PHONE_NUMBER_NAME_UPDATE       = 'phone_number_name_update',
  PHONE_NUMBER_QUALITY_UPDATE    = 'phone_number_quality_update',
  // Other
  SECURITY                       = 'security',
  TEMPLATE_CATEGORY_UPDATE       = 'template_category_update',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface WhatsAppTriggerParams {
  triggerOn: WhatsAppTriggerEvent[]

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultWhatsAppTriggerParams(): WhatsAppTriggerParams {
  return {
    triggerOn:      [WhatsAppTriggerEvent.MESSAGES],
    continueOnFail: false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const WA_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '💬 Messages',                       value: WhatsAppTriggerEvent.MESSAGES                       },
  { label: '🔍 Account Review Update',           value: WhatsAppTriggerEvent.ACCOUNT_REVIEW_UPDATE          },
  { label: '⚙️ Account Update',                  value: WhatsAppTriggerEvent.ACCOUNT_UPDATE                 },
  { label: '🏢 Business Capability Update',      value: WhatsAppTriggerEvent.BUSINESS_CAPABILITY_UPDATE     },
  { label: '📋 Message Template Status Update',  value: WhatsAppTriggerEvent.MESSAGE_TEMPLATE_STATUS_UPDATE },
  { label: '📊 Message Template Quality Update', value: WhatsAppTriggerEvent.MESSAGE_TEMPLATE_QUALITY_UPDATE },
  { label: '📝 Phone Number Name Update',        value: WhatsAppTriggerEvent.PHONE_NUMBER_NAME_UPDATE       },
  { label: '📶 Phone Number Quality Update',     value: WhatsAppTriggerEvent.PHONE_NUMBER_QUALITY_UPDATE    },
  { label: '🔐 Security',                        value: WhatsAppTriggerEvent.SECURITY                       },
  { label: '🏷️ Template Category Update',        value: WhatsAppTriggerEvent.TEMPLATE_CATEGORY_UPDATE       },
]

// ─── Event descriptions (shown as hint text) ──────────────────────────────────

export const WA_TRIGGER_EVENT_DESCRIPTIONS: Record<WhatsAppTriggerEvent, string> = {
  [WhatsAppTriggerEvent.MESSAGES]:
    'Fires when you receive a new message from a customer (text, image, audio, etc.)',
  [WhatsAppTriggerEvent.ACCOUNT_REVIEW_UPDATE]:
    'Triggers when your business account review status changes',
  [WhatsAppTriggerEvent.ACCOUNT_UPDATE]:
    'Monitors changes to your WhatsApp Business account settings',
  [WhatsAppTriggerEvent.BUSINESS_CAPABILITY_UPDATE]:
    'Detects when new features are enabled or disabled on your account',
  [WhatsAppTriggerEvent.MESSAGE_TEMPLATE_STATUS_UPDATE]:
    'Alerts when a message template is approved, rejected, or paused',
  [WhatsAppTriggerEvent.MESSAGE_TEMPLATE_QUALITY_UPDATE]:
    'Notifies of changes to your template quality score',
  [WhatsAppTriggerEvent.PHONE_NUMBER_NAME_UPDATE]:
    'Fires when your WhatsApp display name is updated or reviewed',
  [WhatsAppTriggerEvent.PHONE_NUMBER_QUALITY_UPDATE]:
    'Monitors your phone number quality rating changes',
  [WhatsAppTriggerEvent.SECURITY]:
    'Triggers on security-related events (e.g. client session changes)',
  [WhatsAppTriggerEvent.TEMPLATE_CATEGORY_UPDATE]:
    'Detects when a template category is changed by WhatsApp',
}
