import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TelegramBotTriggerEvent {
  MESSAGE            = 'message',
  EDITED_MESSAGE     = 'edited_message',
  CHANNEL_POST       = 'channel_post',
  EDITED_CHANNEL_POST = 'edited_channel_post',
  CALLBACK_QUERY     = 'callback_query',
  INLINE_QUERY       = 'inline_query',
  CHOSEN_INLINE_RESULT = 'chosen_inline_result',
  POLL               = 'poll',
  POLL_ANSWER        = 'poll_answer',
  CHAT_MEMBER        = 'chat_member',
  MY_CHAT_MEMBER     = 'my_chat_member',
  CHAT_JOIN_REQUEST  = 'chat_join_request',
}

export enum TelegramBotTriggerDownloadMode {
  NEVER  = 'never',
  ALWAYS = 'always',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface TelegramBotTriggerParams {
  // Events
  updates: TelegramBotTriggerEvent[]

  // Filters
  additionalFields: boolean

  // Download
  downloadImages:     boolean
  downloadDocuments:  boolean
  downloadAudio:      boolean
  downloadVideo:      boolean
  downloadVideoNotes: boolean
  downloadVoice:      boolean

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultTelegramBotTriggerParams(): TelegramBotTriggerParams {
  return {
    updates:            [TelegramBotTriggerEvent.MESSAGE],
    additionalFields:   false,
    downloadImages:     false,
    downloadDocuments:  false,
    downloadAudio:      false,
    downloadVideo:      false,
    downloadVideoNotes: false,
    downloadVoice:      false,
    continueOnFail:     false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const BOT_TRIGGER_EVENT_OPTIONS: SelectOption[] = [
  { label: '📩 Message',              value: TelegramBotTriggerEvent.MESSAGE              },
  { label: '✏️ Edited Message',       value: TelegramBotTriggerEvent.EDITED_MESSAGE       },
  { label: '📢 Channel Post',         value: TelegramBotTriggerEvent.CHANNEL_POST         },
  { label: '✏️ Edited Channel Post',  value: TelegramBotTriggerEvent.EDITED_CHANNEL_POST  },
  { label: '🔘 Callback Query',       value: TelegramBotTriggerEvent.CALLBACK_QUERY       },
  { label: '🔍 Inline Query',         value: TelegramBotTriggerEvent.INLINE_QUERY         },
  { label: '✅ Chosen Inline Result', value: TelegramBotTriggerEvent.CHOSEN_INLINE_RESULT },
  { label: '📊 Poll',                 value: TelegramBotTriggerEvent.POLL                 },
  { label: '📊 Poll Answer',          value: TelegramBotTriggerEvent.POLL_ANSWER          },
  { label: '👥 Chat Member',          value: TelegramBotTriggerEvent.CHAT_MEMBER          },
  { label: '🤖 My Chat Member',       value: TelegramBotTriggerEvent.MY_CHAT_MEMBER       },
  { label: '🔗 Chat Join Request',    value: TelegramBotTriggerEvent.CHAT_JOIN_REQUEST    },
]
