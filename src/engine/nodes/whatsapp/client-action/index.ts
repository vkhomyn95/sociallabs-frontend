import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum WAClientResource {
  MESSAGE      = 'MESSAGE',
  MEDIA        = 'MEDIA',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

export enum WAClientOperation {
  // Message
  SEND             = 'SEND',
  SEND_TEMPLATE    = 'SEND_TEMPLATE',
  SEND_INTERACTIVE = 'SEND_INTERACTIVE',
  SEND_AND_WAIT    = 'SEND_AND_WAIT',
  MARK_AS_READ     = 'MARK_AS_READ',
  SEND_TYPING      = 'SEND_TYPING',
  // Media
  UPLOAD_MEDIA   = 'UPLOAD_MEDIA',
  DOWNLOAD_MEDIA = 'DOWNLOAD_MEDIA',
  DELETE_MEDIA   = 'DELETE_MEDIA',
  GET_MEDIA_INFO = 'GET_MEDIA_INFO',
  // Phone Number
  GET_PHONE_NUMBER_INFO = 'GET_PHONE_NUMBER_INFO',
}

export enum WAClientMessageType {
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

export enum WAClientInteractiveType {
  BUTTON       = 'button',       // reply buttons (max 3)
  LIST         = 'list',         // list of items
  PRODUCT      = 'product',      // single product
  PRODUCT_LIST = 'product_list', // multi-product
}

export enum WAClientMediaSource {
  URL = 'url',
  ID  = 'id',
}

export enum WAClientResponseType {
  APPROVAL    = 'approval',
  FREE_TEXT   = 'freeText',
  CUSTOM_FORM = 'customForm',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface WAClientActionParams {
  // Resource & Operation
  resource:  WAClientResource
  operation: WAClientOperation

  // ── Common ──
  phoneNumberId: string   // sender phone number ID
  recipientPhone: string  // recipient (+country code)
  replyToMessageId: string

  // ── Message: Send ──
  messageType:    WAClientMessageType
  // text
  textBody:       string
  previewUrl:     boolean
  // media
  mediaSource:    WAClientMediaSource
  mediaUrl:       string
  mediaId:        string
  mediaCaption:   string
  mediaFilename:  string   // document only
  // location
  locationLat:    string
  locationLng:    string
  locationName:   string
  locationAddress: string
  // reaction
  reactionMsgId:  string
  reactionEmoji:  string
  // contacts
  contactsJson:   string   // JSON array of contact objects

  // ── Message: Send Template ──
  templateName:       string
  templateLanguage:   string
  templateComponents: string  // JSON array

  // ── Message: Send Interactive ──
  interactiveType:    WAClientInteractiveType
  interactiveJson:    string  // full interactive object JSON

  // ── Message: Send and Wait ──
  waitMessage:   string
  responseType:  WAClientResponseType
  approveLabel:  string
  dismissLabel:  string
  waitTimeout:   number | null

  // ── Message: Mark as Read ──
  markReadMessageId: string

  // ── Media: Upload ──
  uploadPropertyName: string

  // ── Media: Download / Delete / Info ──
  mediaIdTarget: string

  // Advanced
  continueOnFail: boolean
  requestTimeout: number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultWAClientActionParams(): WAClientActionParams {
  return {
    resource:           WAClientResource.MESSAGE,
    operation:          WAClientOperation.SEND,
    phoneNumberId:      '',
    recipientPhone:     '',
    replyToMessageId:   '',
    messageType:        WAClientMessageType.TEXT,
    textBody:           '',
    previewUrl:         false,
    mediaSource:        WAClientMediaSource.URL,
    mediaUrl:           '',
    mediaId:            '',
    mediaCaption:       '',
    mediaFilename:      '',
    locationLat:        '',
    locationLng:        '',
    locationName:       '',
    locationAddress:    '',
    reactionMsgId:      '',
    reactionEmoji:      '👍',
    contactsJson:       '[]',
    templateName:       '',
    templateLanguage:   'en_US',
    templateComponents: '[]',
    interactiveType:    WAClientInteractiveType.BUTTON,
    interactiveJson:    JSON.stringify({
      type: 'button',
      body: { text: 'Choose an option:' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'btn_1', title: 'Option 1' } },
          { type: 'reply', reply: { id: 'btn_2', title: 'Option 2' } },
        ],
      },
    }, null, 2),
    waitMessage:         '',
    responseType:        WAClientResponseType.APPROVAL,
    approveLabel:        'Approve',
    dismissLabel:        'Dismiss',
    waitTimeout:         null,
    markReadMessageId:   '',
    uploadPropertyName:  'data',
    mediaIdTarget:       '',
    continueOnFail:      false,
    requestTimeout:      30,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const WA_CLIENT_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Message',      value: WAClientResource.MESSAGE      },
  { label: 'Media',        value: WAClientResource.MEDIA        },
  { label: 'Phone Number', value: WAClientResource.PHONE_NUMBER },
]

export const WA_CLIENT_MSG_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',                       value: WAClientOperation.SEND             },
  { label: 'Send Template',              value: WAClientOperation.SEND_TEMPLATE    },
  { label: 'Send Interactive',           value: WAClientOperation.SEND_INTERACTIVE },
  { label: 'Send and Wait for Response', value: WAClientOperation.SEND_AND_WAIT    },
  { label: 'Mark as Read',               value: WAClientOperation.MARK_AS_READ     },
  { label: 'Send Typing Indicator',      value: WAClientOperation.SEND_TYPING      },
]

export const WA_CLIENT_MEDIA_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Upload',        value: WAClientOperation.UPLOAD_MEDIA   },
  { label: 'Download',      value: WAClientOperation.DOWNLOAD_MEDIA },
  { label: 'Delete',        value: WAClientOperation.DELETE_MEDIA   },
  { label: 'Get Info',      value: WAClientOperation.GET_MEDIA_INFO },
]

export const WA_CLIENT_PHONE_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Get Phone Number Info', value: WAClientOperation.GET_PHONE_NUMBER_INFO },
]

export const WA_CLIENT_MSG_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',     value: WAClientMessageType.TEXT     },
  { label: 'Image',    value: WAClientMessageType.IMAGE    },
  { label: 'Audio',    value: WAClientMessageType.AUDIO    },
  { label: 'Video',    value: WAClientMessageType.VIDEO    },
  { label: 'Document', value: WAClientMessageType.DOCUMENT },
  { label: 'Sticker',  value: WAClientMessageType.STICKER  },
  { label: 'Location', value: WAClientMessageType.LOCATION },
  { label: 'Contacts', value: WAClientMessageType.CONTACTS },
  { label: 'Reaction', value: WAClientMessageType.REACTION },
]

export const WA_CLIENT_MEDIA_SOURCE_OPTIONS: SelectOption[] = [
  { label: 'Media URL', value: WAClientMediaSource.URL },
  { label: 'Media ID',  value: WAClientMediaSource.ID  },
]

export const WA_CLIENT_INTERACTIVE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Reply Buttons (max 3)',    value: WAClientInteractiveType.BUTTON       },
  { label: 'List Message (max 10)',    value: WAClientInteractiveType.LIST         },
  { label: 'Single Product',          value: WAClientInteractiveType.PRODUCT      },
  { label: 'Multi-Product List',      value: WAClientInteractiveType.PRODUCT_LIST },
]

export const WA_CLIENT_RESPONSE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Approval',    value: WAClientResponseType.APPROVAL    },
  { label: 'Free Text',   value: WAClientResponseType.FREE_TEXT   },
  { label: 'Custom Form', value: WAClientResponseType.CUSTOM_FORM },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const MEDIA_MSG_TYPES = [
  WAClientMessageType.IMAGE,
  WAClientMessageType.AUDIO,
  WAClientMessageType.VIDEO,
  WAClientMessageType.DOCUMENT,
  WAClientMessageType.STICKER,
]

export const CAPTION_MSG_TYPES = [
  WAClientMessageType.IMAGE,
  WAClientMessageType.VIDEO,
  WAClientMessageType.DOCUMENT,
]

// Interactive template snippets
export const INTERACTIVE_TEMPLATES: Record<WAClientInteractiveType, object> = {
  [WAClientInteractiveType.BUTTON]: {
    type: 'button',
    header: { type: 'text', text: 'Header (optional)' },
    body: { text: 'Choose an option:' },
    footer: { text: 'Footer (optional)' },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'btn_1', title: 'Option 1' } },
        { type: 'reply', reply: { id: 'btn_2', title: 'Option 2' } },
        { type: 'reply', reply: { id: 'btn_3', title: 'Option 3' } },
      ],
    },
  },
  [WAClientInteractiveType.LIST]: {
    type: 'list',
    header: { type: 'text', text: 'Header (optional)' },
    body: { text: 'Select an item from the list:' },
    footer: { text: 'Footer (optional)' },
    action: {
      button: 'View Options',
      sections: [
        {
          title: 'Section 1',
          rows: [
            { id: 'row_1', title: 'Item 1', description: 'Description' },
            { id: 'row_2', title: 'Item 2', description: 'Description' },
          ],
        },
      ],
    },
  },
  [WAClientInteractiveType.PRODUCT]: {
    type: 'product',
    body: { text: 'Check out this product:' },
    footer: { text: 'Footer (optional)' },
    action: { catalog_id: 'CATALOG_ID', product_retailer_id: 'PRODUCT_SKU' },
  },
  [WAClientInteractiveType.PRODUCT_LIST]: {
    type: 'product_list',
    header: { type: 'text', text: 'Our Products' },
    body: { text: 'Browse our catalog:' },
    footer: { text: 'Footer (optional)' },
    action: {
      catalog_id: 'CATALOG_ID',
      sections: [
        {
          title: 'Category',
          product_items: [
            { product_retailer_id: 'PRODUCT_SKU_1' },
            { product_retailer_id: 'PRODUCT_SKU_2' },
          ],
        },
      ],
    },
  },
}
