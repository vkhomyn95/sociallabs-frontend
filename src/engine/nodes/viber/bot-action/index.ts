import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ViberBotResource {
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

export enum ViberBotOperation {
  SEND      = 'SEND',
  BROADCAST = 'BROADCAST',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface ViberBotActionParams {
  // Resource & Operation
  resource:  ViberBotResource
  operation: ViberBotOperation

  // Receiver
  receiver:     string        // single user ID (send) or comma-separated (broadcast)

  // Sender info
  senderName:   string
  senderAvatar: string

  // Tracking
  trackingData: string
  minApiVersion: number | null

  // ── Text ──
  text: string

  // ── Picture ──
  pictureUrl:       string
  pictureThumbnail: string
  pictureCaption:   string

  // ── Video ──
  videoUrl:       string
  videoThumbnail: string
  videoSize:      number | null   // bytes, required by API
  videoDuration:  number | null   // seconds

  // ── File ──
  fileUrl:  string
  fileSize: number | null         // bytes, required by API
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
  urlMedia:   string
  urlCaption: string

  // ── Rich Media / Carousel ──
  richMediaJson:        string    // full JSON object
  richMediaAltText:     string

  // ── Keyboard (can be attached to any type) ──
  attachKeyboard:  boolean
  keyboardJson:    string

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultViberBotActionParams(): ViberBotActionParams {
  return {
    resource:       ViberBotResource.TEXT,
    operation:      ViberBotOperation.SEND,
    receiver:       '',
    senderName:     '',
    senderAvatar:   '',
    trackingData:   '',
    minApiVersion:  null,
    text:           '',
    pictureUrl:     '',
    pictureThumbnail: '',
    pictureCaption: '',
    videoUrl:       '',
    videoThumbnail: '',
    videoSize:      null,
    videoDuration:  null,
    fileUrl:        '',
    fileSize:       null,
    fileName:       '',
    latitude:       '',
    longitude:      '',
    contactName:    '',
    contactPhone:   '',
    stickerId:      null,
    urlMedia:       '',
    urlCaption:     '',
    richMediaJson:  JSON.stringify({
      Type: 'rich_media',
      ButtonsGroupColumns: 6,
      ButtonsGroupRows: 7,
      BgColor: '#FFFFFF',
      Buttons: [],
    }, null, 2),
    richMediaAltText: '',
    attachKeyboard:   false,
    keyboardJson:     JSON.stringify({
      Type: 'keyboard',
      DefaultHeight: false,
      Buttons: [
        { ActionType: 'reply', ActionBody: 'reply_data', Text: 'Button', TextSize: 'regular' },
      ],
    }, null, 2),
    continueOnFail: false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const VIBER_BOT_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Text',       value: ViberBotResource.TEXT       },
  { label: 'Picture',    value: ViberBotResource.PICTURE    },
  { label: 'Video',      value: ViberBotResource.VIDEO      },
  { label: 'File',       value: ViberBotResource.FILE       },
  { label: 'Location',   value: ViberBotResource.LOCATION   },
  { label: 'Contact',    value: ViberBotResource.CONTACT    },
  { label: 'Sticker',    value: ViberBotResource.STICKER    },
  { label: 'URL',        value: ViberBotResource.URL        },
  { label: 'Rich Media', value: ViberBotResource.RICH_MEDIA },
]

export const VIBER_BOT_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',            value: ViberBotOperation.SEND      },
  { label: 'Broadcast',       value: ViberBotOperation.BROADCAST },
]
