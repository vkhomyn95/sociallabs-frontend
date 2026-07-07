import type { SelectOption } from '@/components/ui/select/useSelect'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum InstagramResource {
  MESSAGE = 'MESSAGE',
  COMMENT = 'COMMENT',
}

export enum InstagramMessageOperation {
  SEND         = 'SEND',
  MARK_AS_READ = 'MARK_AS_READ',
}

export enum InstagramCommentOperation {
  REPLY  = 'REPLY',
  HIDE   = 'HIDE',
  UNHIDE = 'UNHIDE',
  DELETE = 'DELETE',
  GET    = 'GET',
}

export enum InstagramMessageType {
  TEXT       = 'text',
  IMAGE      = 'image',
  AUDIO      = 'audio',
  VIDEO      = 'video',
  STICKER    = 'sticker',
  QUICK_REPLY = 'quick_reply',
  GENERIC_TEMPLATE = 'generic_template',
}

// ─── Params interface ─────────────────────────────────────────────────────────

export interface InstagramActionParams {
  // Resource & Operation
  resource:           InstagramResource
  messageOperation:   InstagramMessageOperation
  commentOperation:   InstagramCommentOperation

  // Common
  igUserId:    string   // Instagram Business Account ID
  recipientId: string   // User IGSID (for DMs)

  // ── Message: Send ──
  messageType: InstagramMessageType

  // text
  textBody: string

  // attachment
  attachmentUrl: string

  // sticker
  stickerId: string   // 'wave', 'fire', 'hearts', etc.

  // quick replies
  quickReplyText:   string
  quickRepliesJson: string   // JSON array

  // generic template
  genericTemplateJson: string   // JSON array of elements

  // reply to
  replyToMessageId: string

  // ── Message: Mark as Read ──
  markReadMessageId: string

  // ── Comment operations ──
  commentId:     string
  replyText:     string

  // Advanced
  continueOnFail: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultInstagramActionParams(): InstagramActionParams {
  return {
    resource:           InstagramResource.MESSAGE,
    messageOperation:   InstagramMessageOperation.SEND,
    commentOperation:   InstagramCommentOperation.REPLY,
    igUserId:           '',
    recipientId:        '',
    messageType:        InstagramMessageType.TEXT,
    textBody:           '',
    attachmentUrl:      '',
    stickerId:          'wave',
    quickReplyText:     '',
    quickRepliesJson:   JSON.stringify([
      { content_type: 'text', title: 'Yes', payload: 'YES' },
      { content_type: 'text', title: 'No',  payload: 'NO'  },
    ], null, 2),
    genericTemplateJson: JSON.stringify([
      {
        title: 'Item Title',
        subtitle: 'Subtitle',
        image_url: 'https://example.com/image.jpg',
        buttons: [
          { type: 'web_url', url: 'https://example.com', title: 'View' },
        ],
      },
    ], null, 2),
    replyToMessageId:  '',
    markReadMessageId: '',
    commentId:         '',
    replyText:         '',
    continueOnFail:    false,
  }
}

// ─── Select options ───────────────────────────────────────────────────────────

export const IG_RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Message', value: InstagramResource.MESSAGE },
  { label: 'Comment', value: InstagramResource.COMMENT },
]

export const IG_MESSAGE_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Send',         value: InstagramMessageOperation.SEND         },
  { label: 'Mark as Read', value: InstagramMessageOperation.MARK_AS_READ },
]

export const IG_COMMENT_OPERATION_OPTIONS: SelectOption[] = [
  { label: 'Reply',  value: InstagramCommentOperation.REPLY  },
  { label: 'Hide',   value: InstagramCommentOperation.HIDE   },
  { label: 'Unhide', value: InstagramCommentOperation.UNHIDE },
  { label: 'Delete', value: InstagramCommentOperation.DELETE },
  { label: 'Get',    value: InstagramCommentOperation.GET    },
]

export const IG_MESSAGE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text',             value: InstagramMessageType.TEXT             },
  { label: 'Image',            value: InstagramMessageType.IMAGE            },
  { label: 'Audio',            value: InstagramMessageType.AUDIO            },
  { label: 'Video',            value: InstagramMessageType.VIDEO            },
  { label: 'Sticker',          value: InstagramMessageType.STICKER          },
  { label: 'Quick Replies',    value: InstagramMessageType.QUICK_REPLY      },
  { label: 'Generic Template', value: InstagramMessageType.GENERIC_TEMPLATE },
]

export const IG_STICKER_OPTIONS: SelectOption[] = [
  { label: '👋 Wave',   value: 'wave'   },
  { label: '❤️ Heart',  value: 'heart'  },
  { label: '👍 Like',   value: 'like'   },
]

export const ATTACHMENT_TYPES = [
  InstagramMessageType.IMAGE,
  InstagramMessageType.AUDIO,
  InstagramMessageType.VIDEO,
]
