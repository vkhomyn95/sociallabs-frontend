// Shapes and limits of WhatsApp's interactive messages, mirroring the backend's ReplyButton, ListSection and ListRow
// (nodes/whatsapp/bot/action/operation) and Meta's limits. Keep in sync.

/** Meta's limits of reply buttons and lists; numbers that repeat, so not an enum. */
export const WhatsAppLimit = {
  REPLY_BUTTONS: 3,
  BUTTON_TITLE: 20,
  LIST_ROWS: 10,
  SECTION_TITLE: 24,
  ROW_TITLE: 24,
  ROW_DESCRIPTION: 72,
} as const

/** Parameters of the node a preview shows next to the buttons or the list. */
export enum InteractiveField {
  BODY = 'body',
  TEXT = 'text',
  HEADER = 'header',
  FOOTER = 'footer',
  BUTTON_TEXT = 'buttonText',
}

/** Fields of a list section and of a row. */
export enum ListField {
  TITLE = 'title',
  ROWS = 'rows',
}

export type ReplyButton = {
  id?: string
  title?: string
}

export type ListRow = {
  id?: string
  title?: string
  description?: string
}

export type ListSection = {
  title?: string
  rows?: ListRow[]
}
