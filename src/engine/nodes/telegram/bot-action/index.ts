import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TelegramBotResource {
  MESSAGE  = 'MESSAGE',
  PHOTO    = 'PHOTO',
  VIDEO    = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO    = 'AUDIO',
  VOICE    = 'VOICE',
  LOCATION = 'LOCATION',
  CONTACT  = 'CONTACT',
  VENUE    = 'VENUE',
  POLL     = 'POLL',
}

export enum TelegramBotOperation {
  SEND    = 'SEND',
  EDIT    = 'EDIT',
  DELETE  = 'DELETE',
  FORWARD = 'FORWARD',
  PIN     = 'PIN',
  UNPIN   = 'UNPIN',
}

export enum TelegramBotParseMode {
  NONE        = 'none',
  MARKDOWN    = 'MARKDOWN',
  MARKDOWN_V2 = 'MARKDOWN_V2',
  HTML        = 'HTML',
}

export enum TelegramBotAttachmentType {
  URL     = 'url',
  FILE_ID = 'FILE_ID',
  BINARY  = 'BINARY',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface TelegramBotActionParams {
  // Resource & Operation
  resource:  TelegramBotResource
  operation: TelegramBotOperation

  // Basic
  chatId: string

  // Message
  text:                  string
  parseMode:             TelegramBotParseMode
  disableWebPagePreview: boolean

  // Media (photo/video/document/audio/voice)
  attachmentType: TelegramBotAttachmentType
  mediaUrl:       string
  mediaFileId:    string
  caption:        string

  // Location / Venue
  latitude:  number | null
  longitude: number | null

  // Contact
  phoneNumber: string
  firstName:   string
  lastName:    string

  // Poll
  question:    string
  pollOptions: string   // one per line
  isAnonymous: boolean

  // General
  disableNotification: boolean
  protectContent:      boolean
  replyToMessageId:    string

  // Advanced
  continueOnFail: boolean
  retryAttempts:  number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultTelegramBotActionParams(): TelegramBotActionParams {
  return {
    resource:              TelegramBotResource.MESSAGE,
    operation:             TelegramBotOperation.SEND,
    chatId:                '',
    text:                  '',
    parseMode:             TelegramBotParseMode.NONE,
    disableWebPagePreview: false,
    attachmentType:        TelegramBotAttachmentType.URL,
    mediaUrl:              '',
    mediaFileId:           '',
    caption:               '',
    latitude:              null,
    longitude:             null,
    phoneNumber:           '',
    firstName:             '',
    lastName:              '',
    question:              '',
    pollOptions:           '',
    isAnonymous:           true,
    disableNotification:   false,
    protectContent:        false,
    replyToMessageId:      '',
    continueOnFail:        false,
    retryAttempts:         0,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const BOT_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Message',  value: TelegramBotResource.MESSAGE  },
  { label: 'Photo',    value: TelegramBotResource.PHOTO    },
  { label: 'Video',    value: TelegramBotResource.VIDEO    },
  { label: 'Document', value: TelegramBotResource.DOCUMENT },
  { label: 'Audio',    value: TelegramBotResource.AUDIO    },
  { label: 'Voice',    value: TelegramBotResource.VOICE    },
  { label: 'Location', value: TelegramBotResource.LOCATION },
  { label: 'Contact',  value: TelegramBotResource.CONTACT  },
  { label: 'Venue',    value: TelegramBotResource.VENUE    },
  { label: 'Poll',     value: TelegramBotResource.POLL     },
]

export const BOT_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',    value: TelegramBotOperation.SEND    },
  { label: 'Edit',    value: TelegramBotOperation.EDIT    },
  { label: 'Delete',  value: TelegramBotOperation.DELETE  },
  { label: 'Forward', value: TelegramBotOperation.FORWARD },
  { label: 'Pin',     value: TelegramBotOperation.PIN     },
  { label: 'Unpin',   value: TelegramBotOperation.UNPIN   },
]

export const BOT_PARSE_MODE_OPTIONS: SelectOption[] = [
  { label: 'None',       value: TelegramBotParseMode.NONE        },
  { label: 'Markdown',   value: TelegramBotParseMode.MARKDOWN    },
  { label: 'MarkdownV2', value: TelegramBotParseMode.MARKDOWN_V2 },
  { label: 'HTML',       value: TelegramBotParseMode.HTML        },
]

export const BOT_ATTACHMENT_OPTIONS: SelectOption[] = [
  { label: 'URL',         value: TelegramBotAttachmentType.URL     },
  { label: 'File ID',     value: TelegramBotAttachmentType.FILE_ID },
  { label: 'Binary Data', value: TelegramBotAttachmentType.BINARY  },
]

// ─── Resource groups (for display conditions) ─────────────────────────────────

export const MEDIA_RESOURCES = [
  TelegramBotResource.PHOTO,
  TelegramBotResource.VIDEO,
  TelegramBotResource.DOCUMENT,
  TelegramBotResource.AUDIO,
  TelegramBotResource.VOICE,
]

export const CAPTION_RESOURCES = [
  TelegramBotResource.PHOTO,
  TelegramBotResource.VIDEO,
  TelegramBotResource.DOCUMENT,
  TelegramBotResource.AUDIO,
]

export const LOCATION_RESOURCES = [
  TelegramBotResource.LOCATION,
  TelegramBotResource.VENUE,
]
