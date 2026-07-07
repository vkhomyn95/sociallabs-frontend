import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ViberClientResource {
  TEXT       = 'TEXT',
  PICTURE    = 'PICTURE',
  VIDEO      = 'VIDEO',
  FILE       = 'FILE',
  LOCATION   = 'LOCATION',
  CONTACT    = 'CONTACT',
  STICKER    = 'STICKER',
  URL        = 'URL',
  RICH_MEDIA = 'RICH_MEDIA',
}

export enum ViberClientOperation {
  SEND        = 'SEND',
  FORWARD     = 'FORWARD',
  DELETE      = 'DELETE',
  GET_HISTORY = 'GET_HISTORY',
  GET_INFO    = 'GET_INFO',
  MARK_READ   = 'MARK_READ',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface ViberClientActionParams {
  // Resource & Operation
  resource:  ViberClientResource
  operation: ViberClientOperation

  // Target
  chatId: string

  // ── Text ──
  text: string

  // ── Picture ──
  pictureUrl:       string
  pictureThumbnail: string
  pictureCaption:   string

  // ── Video ──
  videoUrl:      string
  videoThumbnail: string
  videoSize:     number | null
  videoDuration: number | null

  // ── File ──
  fileUrl:  string
  fileSize: number | null
  fileName: string

  // ── Location ──
  latitude:  string
  longitude: string

  // ── Contact ──
  contactName:  string
  contactPhone: string

  // ── Sticker ──
  stickerId: number | null

  // ── URL ──
  urlMedia:  string
  urlCaption: string

  // ── Rich Media ──
  richMediaJson:    string
  richMediaAltText: string

  // ── Forward ──
  fromChatId: string
  messageId:  string

  // ── Get History ──
  historyLimit:  number
  historyBefore: string   // ISO date or message ID

  // ── Keyboard ──
  attachKeyboard: boolean
  keyboardJson:   string

  // Tracking
  trackingData:  string
  minApiVersion: number | null

  // Advanced
  continueOnFail: boolean
  requestTimeout: number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultViberClientActionParams(): ViberClientActionParams {
  return {
    resource:         ViberClientResource.TEXT,
    operation:        ViberClientOperation.SEND,
    chatId:           '',
    text:             '',
    pictureUrl:       '',
    pictureThumbnail: '',
    pictureCaption:   '',
    videoUrl:         '',
    videoThumbnail:   '',
    videoSize:        null,
    videoDuration:    null,
    fileUrl:          '',
    fileSize:         null,
    fileName:         '',
    latitude:         '',
    longitude:        '',
    contactName:      '',
    contactPhone:     '',
    stickerId:        null,
    urlMedia:         '',
    urlCaption:       '',
    richMediaJson:    JSON.stringify({
      Type: 'rich_media',
      ButtonsGroupColumns: 6,
      ButtonsGroupRows: 7,
      BgColor: '#FFFFFF',
      Buttons: [],
    }, null, 2),
    richMediaAltText: '',
    fromChatId:       '',
    messageId:        '',
    historyLimit:     20,
    historyBefore:    '',
    attachKeyboard:   false,
    keyboardJson:     JSON.stringify({
      Type: 'keyboard',
      DefaultHeight: false,
      Buttons: [
        { ActionType: 'reply', ActionBody: 'reply_data', Text: 'Button', TextSize: 'regular' },
      ],
    }, null, 2),
    trackingData:    '',
    minApiVersion:   null,
    continueOnFail:  false,
    requestTimeout:  30,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const VIBER_CLIENT_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Text',       value: ViberClientResource.TEXT       },
  { label: 'Picture',    value: ViberClientResource.PICTURE    },
  { label: 'Video',      value: ViberClientResource.VIDEO      },
  { label: 'File',       value: ViberClientResource.FILE       },
  { label: 'Location',   value: ViberClientResource.LOCATION   },
  { label: 'Contact',    value: ViberClientResource.CONTACT    },
  { label: 'Sticker',    value: ViberClientResource.STICKER    },
  { label: 'URL',        value: ViberClientResource.URL        },
  { label: 'Rich Media', value: ViberClientResource.RICH_MEDIA },
]

export const VIBER_CLIENT_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',         value: ViberClientOperation.SEND        },
  { label: 'Forward',      value: ViberClientOperation.FORWARD     },
  { label: 'Delete',       value: ViberClientOperation.DELETE      },
  { label: 'Get History',  value: ViberClientOperation.GET_HISTORY },
  { label: 'Get Chat Info',value: ViberClientOperation.GET_INFO    },
  { label: 'Mark as Read', value: ViberClientOperation.MARK_READ   },
]

// ─── Operation groups ─────────────────────────────────────────────────────────

export const SEND_OPERATIONS = [ViberClientOperation.SEND]
export const MSG_OPERATIONS  = [
  ViberClientOperation.DELETE,
  ViberClientOperation.FORWARD,
]
