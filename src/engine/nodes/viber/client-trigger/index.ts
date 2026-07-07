import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ViberClientTriggerEvent {
  MESSAGE              = 'MESSAGE',
  SUBSCRIBED           = 'SUBSCRIBED',
  UNSUBSCRIBED         = 'UNSUBSCRIBED',
  DELIVERED            = 'DELIVERED',
  SEEN                 = 'SEEN',
  FAILED               = 'FAILED',
  CONVERSATION_STARTED = 'CONVERSATION_STARTED',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface ViberClientTriggerParams {
  // Events to watch
  events: ViberClientTriggerEvent[]

  // Message type filters (only for MESSAGE event)
  filterMessageTypes: boolean
  messageTypes:       ViberClientMessageType[]

  // Chat filters
  filterChats: boolean
  chatIds:     string   // comma-separated

  // Sender filters
  filterSenders: boolean
  senderIds:     string // comma-separated

  // Downloads
  downloadImages:  boolean
  downloadVideos:  boolean
  downloadFiles:   boolean

  // Advanced
  continueOnFail: boolean
}

export enum ViberClientMessageType {
  TEXT       = 'text',
  PICTURE    = 'picture',
  VIDEO      = 'video',
  FILE       = 'file',
  STICKER    = 'sticker',
  CONTACT    = 'contact',
  URL        = 'url',
  LOCATION   = 'location',
  RICH_MEDIA = 'rich_media',
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultViberClientTriggerParams(): ViberClientTriggerParams {
  return {
    events:             [ViberClientTriggerEvent.MESSAGE],
    filterMessageTypes: false,
    messageTypes:       [],
    filterChats:        false,
    chatIds:            '',
    filterSenders:      false,
    senderIds:          '',
    downloadImages:     false,
    downloadVideos:     false,
    downloadFiles:      false,
    continueOnFail:     false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const CLIENT_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '💬 Message',              value: ViberClientTriggerEvent.MESSAGE              },
  { label: '✅ Subscribed',           value: ViberClientTriggerEvent.SUBSCRIBED           },
  { label: '🚫 Unsubscribed',         value: ViberClientTriggerEvent.UNSUBSCRIBED         },
  { label: '📬 Delivered',            value: ViberClientTriggerEvent.DELIVERED            },
  { label: '👁️ Seen',                 value: ViberClientTriggerEvent.SEEN                 },
  { label: '❌ Failed',               value: ViberClientTriggerEvent.FAILED               },
  { label: '🤝 Conversation Started', value: ViberClientTriggerEvent.CONVERSATION_STARTED },
]

export const CLIENT_MESSAGE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',       value: ViberClientMessageType.TEXT       },
  { label: 'Picture',    value: ViberClientMessageType.PICTURE    },
  { label: 'Video',      value: ViberClientMessageType.VIDEO      },
  { label: 'File',       value: ViberClientMessageType.FILE       },
  { label: 'Sticker',    value: ViberClientMessageType.STICKER    },
  { label: 'Contact',    value: ViberClientMessageType.CONTACT    },
  { label: 'URL',        value: ViberClientMessageType.URL        },
  { label: 'Location',   value: ViberClientMessageType.LOCATION   },
  { label: 'Rich Media', value: ViberClientMessageType.RICH_MEDIA },
]
