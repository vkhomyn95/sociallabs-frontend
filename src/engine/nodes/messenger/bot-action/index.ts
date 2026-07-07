import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum MessengerResource {
  MESSAGE = 'MESSAGE',
}

export enum MessengerOperation {
  SEND          = 'SEND',
  SEND_TEMPLATE = 'SEND_TEMPLATE',
  SENDER_ACTION = 'SENDER_ACTION',
}

export enum MessengerMessageType {
  TEXT        = 'text',
  IMAGE       = 'image',
  AUDIO       = 'audio',
  VIDEO       = 'video',
  FILE        = 'file',
  QUICK_REPLY = 'quick_reply',
  GENERIC_TEMPLATE = 'generic_template',
  BUTTON_TEMPLATE  = 'button_template',
  MEDIA_TEMPLATE   = 'media_template',
}

export enum MessengerSenderAction {
  TYPING_ON  = 'typing_on',
  TYPING_OFF = 'typing_off',
  MARK_SEEN  = 'mark_seen',
}

export enum MessengerMessagingType {
  RESPONSE     = 'RESPONSE',       // reply within 24h window
  UPDATE       = 'UPDATE',         // proactive with tag
  MESSAGE_TAG  = 'MESSAGE_TAG',    // outside 24h with tag
}

export enum MessengerNotificationType {
  REGULAR      = 'REGULAR',
  SILENT_PUSH  = 'SILENT_PUSH',
  NO_PUSH      = 'NO_PUSH',
}

export enum MessengerTag {
  CONFIRMED_EVENT_UPDATE    = 'CONFIRMED_EVENT_UPDATE',
  POST_PURCHASE_UPDATE      = 'POST_PURCHASE_UPDATE',
  ACCOUNT_UPDATE            = 'ACCOUNT_UPDATE',
  HUMAN_AGENT               = 'HUMAN_AGENT',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface MessengerActionParams {
  // Resource & Operation
  resource:  MessengerResource
  operation: MessengerOperation

  // Common
  pageId:      string    // Facebook Page ID (sender)
  recipientId: string    // User PSID

  // ── Send ──
  messageType:     MessengerMessageType
  messagingType:   MessengerMessagingType
  notificationType: MessengerNotificationType
  tag:             MessengerTag | ''

  // text
  textBody:        string

  // attachment (image/audio/video/file)
  attachmentSource: 'url' | 'id'
  attachmentUrl:    string
  attachmentId:     string
  isReusable:       boolean   // save attachment for reuse

  // quick replies
  quickReplyText:  string
  quickRepliesJson: string   // JSON array of quick reply buttons

  // generic template (carousel)
  genericTemplateJson: string  // JSON array of elements

  // button template
  buttonTemplateText: string
  buttonTemplateJson: string   // JSON array of buttons

  // media template
  mediaTemplateType:    'image' | 'video'
  mediaTemplateUrl:     string
  mediaTemplateButtons: string  // JSON array of buttons (max 1)

  // reply to
  replyToMessageId: string

  // ── Sender Action ──
  senderAction: MessengerSenderAction

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultMessengerActionParams(): MessengerActionParams {
  return {
    resource:          MessengerResource.MESSAGE,
    operation:         MessengerOperation.SEND,
    pageId:            '',
    recipientId:       '',
    messageType:       MessengerMessageType.TEXT,
    messagingType:     MessengerMessagingType.RESPONSE,
    notificationType:  MessengerNotificationType.REGULAR,
    tag:               '',
    textBody:          '',
    attachmentSource:  'url',
    attachmentUrl:     '',
    attachmentId:      '',
    isReusable:        false,
    quickReplyText:    '',
    quickRepliesJson:  JSON.stringify([
      { content_type: 'text', title: 'Yes', payload: 'YES' },
      { content_type: 'text', title: 'No',  payload: 'NO'  },
    ], null, 2),
    genericTemplateJson: JSON.stringify([
      {
        title: 'Product Title',
        subtitle: 'Subtitle here',
        image_url: 'https://example.com/image.jpg',
        buttons: [
          { type: 'web_url', url: 'https://example.com', title: 'View' },
          { type: 'postback', title: 'Buy', payload: 'BUY_ITEM' },
        ],
      },
    ], null, 2),
    buttonTemplateText: '',
    buttonTemplateJson: JSON.stringify([
      { type: 'web_url', url: 'https://example.com', title: 'Visit Website' },
      { type: 'postback', title: 'Get Started', payload: 'GET_STARTED' },
    ], null, 2),
    mediaTemplateType:    'image',
    mediaTemplateUrl:     '',
    mediaTemplateButtons: JSON.stringify([
      { type: 'web_url', url: 'https://example.com', title: 'View' },
    ], null, 2),
    replyToMessageId:  '',
    senderAction:      MessengerSenderAction.TYPING_ON,
    continueOnFail:    false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const MESSENGER_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',          value: MessengerOperation.SEND          },
  { label: 'Send Template', value: MessengerOperation.SEND_TEMPLATE },
  { label: 'Sender Action', value: MessengerOperation.SENDER_ACTION },
]

export const MESSENGER_MSG_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',             value: MessengerMessageType.TEXT             },
  { label: 'Image',            value: MessengerMessageType.IMAGE            },
  { label: 'Audio',            value: MessengerMessageType.AUDIO            },
  { label: 'Video',            value: MessengerMessageType.VIDEO            },
  { label: 'File',             value: MessengerMessageType.FILE             },
  { label: 'Quick Replies',    value: MessengerMessageType.QUICK_REPLY      },
  { label: 'Generic Template', value: MessengerMessageType.GENERIC_TEMPLATE },
  { label: 'Button Template',  value: MessengerMessageType.BUTTON_TEMPLATE  },
  { label: 'Media Template',   value: MessengerMessageType.MEDIA_TEMPLATE   },
]

export const MESSENGER_SENDER_ACTION_OPTIONS: SelectOption[] = [
  { label: 'Typing On',  value: MessengerSenderAction.TYPING_ON  },
  { label: 'Typing Off', value: MessengerSenderAction.TYPING_OFF },
  { label: 'Mark Seen',  value: MessengerSenderAction.MARK_SEEN  },
]

export const MESSENGER_MESSAGING_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Response (within 24h window)',    value: MessengerMessagingType.RESPONSE    },
  { label: 'Update (proactive)',              value: MessengerMessagingType.UPDATE      },
  { label: 'Message Tag (outside 24h)',       value: MessengerMessagingType.MESSAGE_TAG },
]

export const MESSENGER_NOTIFICATION_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Regular (sound + notification)',  value: MessengerNotificationType.REGULAR     },
  { label: 'Silent Push (notification only)', value: MessengerNotificationType.SILENT_PUSH },
  { label: 'No Push (no notification)',       value: MessengerNotificationType.NO_PUSH     },
]

export const MESSENGER_TAG_OPTIONS: SelectOption[] = [
  { label: 'None',                    value: ''                                          },
  { label: 'Confirmed Event Update',  value: MessengerTag.CONFIRMED_EVENT_UPDATE         },
  { label: 'Post Purchase Update',    value: MessengerTag.POST_PURCHASE_UPDATE           },
  { label: 'Account Update',          value: MessengerTag.ACCOUNT_UPDATE                 },
  { label: 'Human Agent',             value: MessengerTag.HUMAN_AGENT                    },
]

export const MESSENGER_ATTACHMENT_SOURCE_OPTIONS: SelectOption[] = [
  { label: 'URL',         value: 'url' },
  { label: 'Attachment ID', value: 'id'  },
]

export const MESSENGER_MEDIA_TEMPLATE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ATTACHMENT_MSG_TYPES = [
  MessengerMessageType.IMAGE,
  MessengerMessageType.AUDIO,
  MessengerMessageType.VIDEO,
  MessengerMessageType.FILE,
]
