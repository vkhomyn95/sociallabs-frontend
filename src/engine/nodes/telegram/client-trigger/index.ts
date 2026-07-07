import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TelegramClientTriggerEvent {
  NEW_MESSAGE         = 'NEW_MESSAGE',
  MESSAGE_EDITED      = 'MESSAGE_EDITED',
  MESSAGE_DELETED     = 'MESSAGE_DELETED',
  NEW_CHAT            = 'NEW_CHAT',
  CHAT_UPDATED        = 'CHAT_UPDATED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  CHAT_MEMBER_UPDATED = 'CHAT_MEMBER_UPDATED',
  CALLBACK_QUERY      = 'CALLBACK_QUERY',
  INLINE_QUERY        = 'INLINE_QUERY',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface TelegramClientTriggerParams {
  // Events
  events: TelegramClientTriggerEvent[]

  // Filters
  filterChats:   boolean
  chatIds:       string   // comma-separated

  filterSenders: boolean
  senderIds:     string   // comma-separated

  onlyPrivate:  boolean
  onlyGroups:   boolean
  onlyChannels: boolean

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultTelegramClientTriggerParams(): TelegramClientTriggerParams {
  return {
    events:         [TelegramClientTriggerEvent.NEW_MESSAGE],
    filterChats:    false,
    chatIds:        '',
    filterSenders:  false,
    senderIds:      '',
    onlyPrivate:    false,
    onlyGroups:     false,
    onlyChannels:   false,
    continueOnFail: false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const CLIENT_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '📩 New Message',          value: TelegramClientTriggerEvent.NEW_MESSAGE         },
  { label: '✏️ Message Edited',       value: TelegramClientTriggerEvent.MESSAGE_EDITED      },
  { label: '🗑️ Message Deleted',      value: TelegramClientTriggerEvent.MESSAGE_DELETED     },
  { label: '💬 New Chat',             value: TelegramClientTriggerEvent.NEW_CHAT            },
  { label: '🔄 Chat Updated',         value: TelegramClientTriggerEvent.CHAT_UPDATED        },
  { label: '👤 User Status Changed',  value: TelegramClientTriggerEvent.USER_STATUS_CHANGED },
  { label: '👥 Chat Member Updated',  value: TelegramClientTriggerEvent.CHAT_MEMBER_UPDATED },
  { label: '🔘 Callback Query',       value: TelegramClientTriggerEvent.CALLBACK_QUERY      },
  { label: '🔍 Inline Query',         value: TelegramClientTriggerEvent.INLINE_QUERY        },
]
