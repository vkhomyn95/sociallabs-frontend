import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum WhatsAppResource {
  MESSAGE = 'MESSAGE',
  MEDIA   = 'MEDIA',
}

export enum WhatsAppOperation {
  // Message
  SEND              = 'SEND',
  SEND_TEMPLATE     = 'SEND_TEMPLATE',
  SEND_AND_WAIT     = 'SEND_AND_WAIT',
  // Media
  UPLOAD_MEDIA      = 'UPLOAD_MEDIA',
  DOWNLOAD_MEDIA    = 'DOWNLOAD_MEDIA',
  DELETE_MEDIA      = 'DELETE_MEDIA',
}

export enum WhatsAppMessageType {
  TEXT     = 'text',
  IMAGE    = 'image',
  AUDIO    = 'audio',
  VIDEO    = 'video',
  DOCUMENT = 'document',
  STICKER  = 'sticker',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  REACTION = 'reaction',
}

export enum WhatsAppResponseType {
  APPROVAL   = 'approval',
  FREE_TEXT  = 'freeText',
  CUSTOM_FORM = 'customForm',
}

export enum WhatsAppTemplateComponentType {
  HEADER = 'header',
  BODY   = 'body',
  BUTTON = 'button',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface WhatsAppActionParams {
  // Resource & Operation
  resource:  WhatsAppResource
  operation: WhatsAppOperation

  // ── Message shared ──
  senderPhoneNumberId: string    // Sender Phone Number ID
  recipientPhone:      string    // Recipient's phone number

  // ── Send text ──
  messageType:     WhatsAppMessageType
  textBody:        string
  previewUrl:      boolean

  // ── Send media (image/audio/video/document) ──
  mediaId:        string    // or mediaUrl
  mediaSource:    'id' | 'url'
  mediaUrl:       string
  mediaCaption:   string
  mediaFilename:  string    // for document

  // ── Location ──
  locationLatitude:  string
  locationLongitude: string
  locationName:      string
  locationAddress:   string

  // ── Reaction ──
  reactionMessageId: string
  reactionEmoji:     string

  // ── Reply context ──
  replyToMessageId: string

  // ── Send Template ──
  templateName:     string
  templateLanguage: string
  templateComponents: string    // JSON array of components

  // ── Send and Wait ──
  waitMessage:      string
  responseType:     WhatsAppResponseType
  approveLabel:     string
  dismissLabel:     string
  waitTimeout:      number | null    // minutes

  // ── Media: Upload ──
  uploadPropertyName: string    // binary property containing the file

  // ── Media: Download / Delete ──
  mediaIdTarget: string         // media ID to download or delete

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultWhatsAppActionParams(): WhatsAppActionParams {
  return {
    resource:            WhatsAppResource.MESSAGE,
    operation:           WhatsAppOperation.SEND,
    senderPhoneNumberId: '',
    recipientPhone:      '',
    messageType:         WhatsAppMessageType.TEXT,
    textBody:            '',
    previewUrl:          false,
    mediaId:             '',
    mediaSource:         'url',
    mediaUrl:            '',
    mediaCaption:        '',
    mediaFilename:       '',
    locationLatitude:    '',
    locationLongitude:   '',
    locationName:        '',
    locationAddress:     '',
    reactionMessageId:   '',
    reactionEmoji:       '👍',
    replyToMessageId:    '',
    templateName:        '',
    templateLanguage:    'en_US',
    templateComponents:  '[]',
    waitMessage:         '',
    responseType:        WhatsAppResponseType.APPROVAL,
    approveLabel:        'Approve',
    dismissLabel:        'Dismiss',
    waitTimeout:         null,
    uploadPropertyName:  'data',
    mediaIdTarget:       '',
    continueOnFail:      false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const WA_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Message', value: WhatsAppResource.MESSAGE },
  { label: 'Media',   value: WhatsAppResource.MEDIA   },
]

export const WA_MESSAGE_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',                     value: WhatsAppOperation.SEND          },
  { label: 'Send Template',            value: WhatsAppOperation.SEND_TEMPLATE },
  { label: 'Send and Wait for Response', value: WhatsAppOperation.SEND_AND_WAIT },
]

export const WA_MEDIA_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Upload',   value: WhatsAppOperation.UPLOAD_MEDIA   },
  { label: 'Download', value: WhatsAppOperation.DOWNLOAD_MEDIA },
  { label: 'Delete',   value: WhatsAppOperation.DELETE_MEDIA   },
]

export const WA_MESSAGE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',     value: WhatsAppMessageType.TEXT     },
  { label: 'Image',    value: WhatsAppMessageType.IMAGE    },
  { label: 'Audio',    value: WhatsAppMessageType.AUDIO    },
  { label: 'Video',    value: WhatsAppMessageType.VIDEO    },
  { label: 'Document', value: WhatsAppMessageType.DOCUMENT },
  { label: 'Sticker',  value: WhatsAppMessageType.STICKER  },
  { label: 'Location', value: WhatsAppMessageType.LOCATION },
  { label: 'Contacts', value: WhatsAppMessageType.CONTACTS },
  { label: 'Reaction', value: WhatsAppMessageType.REACTION },
]

export const WA_MEDIA_SOURCE_OPTIONS: SelectOption[] = [
  { label: 'Media ID',  value: 'id'  },
  { label: 'Media URL', value: 'url' },
]

export const WA_RESPONSE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Approval',    value: WhatsAppResponseType.APPROVAL    },
  { label: 'Free Text',   value: WhatsAppResponseType.FREE_TEXT   },
  { label: 'Custom Form', value: WhatsAppResponseType.CUSTOM_FORM },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const MEDIA_MESSAGE_TYPES = [
  WhatsAppMessageType.IMAGE,
  WhatsAppMessageType.AUDIO,
  WhatsAppMessageType.VIDEO,
  WhatsAppMessageType.DOCUMENT,
  WhatsAppMessageType.STICKER,
]

export const CAPTION_MESSAGE_TYPES = [
  WhatsAppMessageType.IMAGE,
  WhatsAppMessageType.VIDEO,
  WhatsAppMessageType.DOCUMENT,
]
