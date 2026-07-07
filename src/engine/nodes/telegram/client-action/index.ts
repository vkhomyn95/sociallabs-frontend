import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TelegramClientResource {
  MESSAGE    = 'MESSAGE',
  PHOTO      = 'PHOTO',
  VIDEO      = 'VIDEO',
  DOCUMENT   = 'DOCUMENT',
  AUDIO      = 'AUDIO',
  VOICE      = 'VOICE',
  VIDEO_NOTE = 'VIDEO_NOTE',
  LOCATION   = 'LOCATION',
  CONTACT    = 'CONTACT',
  VENUE      = 'VENUE',
  POLL       = 'POLL',
  STICKER    = 'STICKER',
  ANIMATION  = 'ANIMATION',
  DICE       = 'DICE',
  CHAT       = 'CHAT',
  CHAT_MEMBER = 'CHAT_MEMBER',
}

export enum TelegramClientOperation {
  SEND         = 'SEND',
  EDIT         = 'EDIT',
  DELETE       = 'DELETE',
  FORWARD      = 'FORWARD',
  PIN          = 'PIN',
  UNPIN        = 'UNPIN',
  READ         = 'READ',
  GET          = 'GET',
  GET_HISTORY  = 'GET_HISTORY',
  SEND_TYPING  = 'SEND_TYPING',
}

export enum TelegramClientParseMode {
  TEXT     = 'TEXT',
  MARKDOWN = 'MARKDOWN',
  HTML     = 'HTML',
}

export enum TelegramClientAttachmentType {
  LOCAL   = 'LOCAL',
  REMOTE  = 'REMOTE',
  FILE_ID = 'FILE_ID',
}

export enum TelegramClientPollType {
  REGULAR = 'REGULAR',
  QUIZ    = 'QUIZ',
}

export enum TelegramClientDiceEmoji {
  DICE         = '🎲',
  DART         = '🎯',
  BASKETBALL   = '🏀',
  FOOTBALL     = '⚽',
  SLOT_MACHINE = '🎰',
  BOWLING      = '🎳',
}

export enum TelegramClientChatAction {
  TYPING           = 'TYPING',
  UPLOAD_PHOTO     = 'UPLOAD_PHOTO',
  RECORD_VIDEO     = 'RECORD_VIDEO',
  UPLOAD_VIDEO     = 'UPLOAD_VIDEO',
  RECORD_VOICE     = 'RECORD_VOICE',
  UPLOAD_VOICE     = 'UPLOAD_VOICE',
  UPLOAD_DOCUMENT  = 'UPLOAD_DOCUMENT',
  CHOOSE_STICKER   = 'CHOOSE_STICKER',
  FIND_LOCATION    = 'FIND_LOCATION',
}

export enum TelegramClientReplyMarkupType {
  INLINE     = 'INLINE',
  KEYBOARD   = 'KEYBOARD',
  REMOVE     = 'REMOVE',
  FORCE_REPLY = 'FORCE_REPLY',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface TelegramClientActionParams {
  // Resource & Operation
  resource:  TelegramClientResource
  operation: TelegramClientOperation

  // Basic
  chatId: string

  // Message
  text:                  string
  parseMode:             TelegramClientParseMode
  disableWebPagePreview: boolean
  clearDraft:            boolean

  // Media
  attachmentType: TelegramClientAttachmentType
  localFilePath:  string
  remoteFileUrl:  string
  fileId:         number | null
  caption:        string
  hasSpoiler:     boolean
  ttl:            number | null

  // Photo specific
  photoCompressionQuality: number

  // Video specific
  duration:          number | null
  width:             number | null
  height:            number | null
  supportsStreaming:  boolean

  // Audio specific
  performer: string
  title:     string

  // Location
  latitude:   number | null
  longitude:  number | null
  livePeriod: number | null

  // Contact
  phoneNumber: string
  firstName:   string
  lastName:    string

  // Venue
  venueName: string
  address:   string

  // Poll
  question:    string
  pollOptions: string    // JSON array
  isAnonymous: boolean
  pollType:    TelegramClientPollType

  // Dice
  diceEmoji: TelegramClientDiceEmoji

  // Edit / Delete / Pin
  messageId: string

  // Forward
  fromChatId:  string
  messageIds:  string    // JSON array
  sendCopy:    boolean

  // Typing
  chatAction: TelegramClientChatAction

  // Reply markup
  replyMarkupType: TelegramClientReplyMarkupType
  buttons:         string    // JSON

  // General
  disableNotification: boolean
  protectContent:      boolean
  replyToMessageId:    number | null
  messageThreadId:     number | null

  // Advanced
  continueOnFail:  boolean
  retryAttempts:   number
  requestTimeout:  number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultTelegramClientActionParams(): TelegramClientActionParams {
  return {
    resource:               TelegramClientResource.MESSAGE,
    operation:              TelegramClientOperation.SEND,
    chatId:                 '',
    text:                   '',
    parseMode:              TelegramClientParseMode.TEXT,
    disableWebPagePreview:  false,
    clearDraft:             true,
    attachmentType:         TelegramClientAttachmentType.REMOTE,
    localFilePath:          '',
    remoteFileUrl:          '',
    fileId:                 null,
    caption:                '',
    hasSpoiler:             false,
    ttl:                    null,
    photoCompressionQuality: 85,
    duration:               null,
    width:                  null,
    height:                 null,
    supportsStreaming:       false,
    performer:              '',
    title:                  '',
    latitude:               null,
    longitude:              null,
    livePeriod:             null,
    phoneNumber:            '',
    firstName:              '',
    lastName:               '',
    venueName:              '',
    address:                '',
    question:               '',
    pollOptions:            '["Option 1", "Option 2"]',
    isAnonymous:            true,
    pollType:               TelegramClientPollType.REGULAR,
    diceEmoji:              TelegramClientDiceEmoji.DICE,
    messageId:              '',
    fromChatId:             '',
    messageIds:             '[123]',
    sendCopy:               false,
    chatAction:             TelegramClientChatAction.TYPING,
    replyMarkupType:        TelegramClientReplyMarkupType.INLINE,
    buttons:                '[[{"text": "Button 1", "callback_data": "data1"}]]',
    disableNotification:    false,
    protectContent:         false,
    replyToMessageId:       null,
    messageThreadId:        null,
    continueOnFail:         false,
    retryAttempts:          0,
    requestTimeout:         30,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const CLIENT_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Message',    value: TelegramClientResource.MESSAGE    },
  { label: 'Photo',      value: TelegramClientResource.PHOTO      },
  { label: 'Video',      value: TelegramClientResource.VIDEO      },
  { label: 'Document',   value: TelegramClientResource.DOCUMENT   },
  { label: 'Audio',      value: TelegramClientResource.AUDIO      },
  { label: 'Voice',      value: TelegramClientResource.VOICE      },
  { label: 'Video Note', value: TelegramClientResource.VIDEO_NOTE },
  { label: 'Location',   value: TelegramClientResource.LOCATION   },
  { label: 'Contact',    value: TelegramClientResource.CONTACT    },
  { label: 'Venue',      value: TelegramClientResource.VENUE      },
  { label: 'Poll',       value: TelegramClientResource.POLL       },
  { label: 'Sticker',    value: TelegramClientResource.STICKER    },
  { label: 'Animation',  value: TelegramClientResource.ANIMATION  },
  { label: 'Dice',       value: TelegramClientResource.DICE       },
  { label: 'Chat',       value: TelegramClientResource.CHAT       },
  { label: 'Chat Member',value: TelegramClientResource.CHAT_MEMBER},
]

export const CLIENT_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',         value: TelegramClientOperation.SEND        },
  { label: 'Edit',         value: TelegramClientOperation.EDIT        },
  { label: 'Delete',       value: TelegramClientOperation.DELETE      },
  { label: 'Forward',      value: TelegramClientOperation.FORWARD     },
  { label: 'Pin',          value: TelegramClientOperation.PIN         },
  { label: 'Unpin',        value: TelegramClientOperation.UNPIN       },
  { label: 'Read',         value: TelegramClientOperation.READ        },
  { label: 'Get',          value: TelegramClientOperation.GET         },
  { label: 'Get History',  value: TelegramClientOperation.GET_HISTORY },
  { label: 'Send Typing',  value: TelegramClientOperation.SEND_TYPING },
]

export const CLIENT_PARSE_MODE_OPTIONS: SelectOption[] = [
  { label: 'Plain Text', value: TelegramClientParseMode.TEXT     },
  { label: 'Markdown',   value: TelegramClientParseMode.MARKDOWN },
  { label: 'HTML',       value: TelegramClientParseMode.HTML     },
]

export const CLIENT_ATTACHMENT_OPTIONS: SelectOption[] = [
  { label: 'Local File',  value: TelegramClientAttachmentType.LOCAL   },
  { label: 'Remote URL',  value: TelegramClientAttachmentType.REMOTE  },
  { label: 'File ID',     value: TelegramClientAttachmentType.FILE_ID },
]

export const CLIENT_POLL_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Regular', value: TelegramClientPollType.REGULAR },
  { label: 'Quiz',    value: TelegramClientPollType.QUIZ    },
]

export const CLIENT_DICE_OPTIONS: SelectOption[] = [
  { label: 'Dice 🎲',          value: TelegramClientDiceEmoji.DICE         },
  { label: 'Dart 🎯',          value: TelegramClientDiceEmoji.DART         },
  { label: 'Basketball 🏀',    value: TelegramClientDiceEmoji.BASKETBALL   },
  { label: 'Football ⚽',      value: TelegramClientDiceEmoji.FOOTBALL     },
  { label: 'Slot Machine 🎰',  value: TelegramClientDiceEmoji.SLOT_MACHINE },
  { label: 'Bowling 🎳',       value: TelegramClientDiceEmoji.BOWLING      },
]

export const CLIENT_CHAT_ACTION_OPTIONS: SelectOption[] = [
  { label: 'Typing',             value: TelegramClientChatAction.TYPING          },
  { label: 'Uploading Photo',    value: TelegramClientChatAction.UPLOAD_PHOTO    },
  { label: 'Recording Video',    value: TelegramClientChatAction.RECORD_VIDEO    },
  { label: 'Uploading Video',    value: TelegramClientChatAction.UPLOAD_VIDEO    },
  { label: 'Recording Voice',    value: TelegramClientChatAction.RECORD_VOICE    },
  { label: 'Uploading Voice',    value: TelegramClientChatAction.UPLOAD_VOICE    },
  { label: 'Uploading Document', value: TelegramClientChatAction.UPLOAD_DOCUMENT },
  { label: 'Choosing Sticker',   value: TelegramClientChatAction.CHOOSE_STICKER  },
  { label: 'Finding Location',   value: TelegramClientChatAction.FIND_LOCATION   },
]

export const CLIENT_REPLY_MARKUP_OPTIONS: SelectOption[] = [
  { label: 'Inline Keyboard',  value: TelegramClientReplyMarkupType.INLINE      },
  { label: 'Reply Keyboard',   value: TelegramClientReplyMarkupType.KEYBOARD    },
  { label: 'Remove Keyboard',  value: TelegramClientReplyMarkupType.REMOVE      },
  { label: 'Force Reply',      value: TelegramClientReplyMarkupType.FORCE_REPLY },
]

// ─── Resource groups ──────────────────────────────────────────────────────────

export const MEDIA_RESOURCES = [
  TelegramClientResource.PHOTO,
  TelegramClientResource.VIDEO,
  TelegramClientResource.DOCUMENT,
  TelegramClientResource.AUDIO,
  TelegramClientResource.VOICE,
  TelegramClientResource.VIDEO_NOTE,
  TelegramClientResource.STICKER,
  TelegramClientResource.ANIMATION,
]

export const CAPTION_RESOURCES = [
  TelegramClientResource.PHOTO,
  TelegramClientResource.VIDEO,
  TelegramClientResource.DOCUMENT,
  TelegramClientResource.AUDIO,
  TelegramClientResource.ANIMATION,
]

export const SPOILER_RESOURCES = [
  TelegramClientResource.PHOTO,
  TelegramClientResource.VIDEO,
]

export const LOCATION_RESOURCES = [
  TelegramClientResource.LOCATION,
  TelegramClientResource.VENUE,
]

export const EDIT_OPERATIONS = [
  TelegramClientOperation.EDIT,
  TelegramClientOperation.DELETE,
  TelegramClientOperation.PIN,
  TelegramClientOperation.GET,
]
