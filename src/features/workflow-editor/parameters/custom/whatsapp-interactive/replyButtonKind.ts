import type { ButtonKind } from '../keyboard-common/keyboardLayout'
import { ColumnLayout } from './columnLayout'
import { WhatsAppLimit, type ReplyButton } from './whatsappInteractive.types'

export const REPLY_BUTTON_LAYOUT = new ColumnLayout<ReplyButton>(WhatsAppLimit.REPLY_BUTTONS)

/** Reply buttons: up to three in a column, each an id the trigger gets back and a title. */
export const REPLY_BUTTONS: ButtonKind<ReplyButton> = {
  layout: REPLY_BUTTON_LAYOUT,
  newButton: (index) => ({ id: `option_${index}`, title: `Option ${index}` }),
  icon: () => null,
  fields: (declared) => [...declared],
}

/** @returns the saved buttons, skipping anything that is not a button (an expression, a stray value) */
export function replyButtonsOf(value: unknown): ReplyButton[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is ReplyButton => typeof entry === 'object' && entry !== null && !Array.isArray(entry))
}

/** @returns how long a text is against its limit, for a counter: `"12/20"` */
export function counterOf(text: string | undefined, limit: number): string {
  return `${(text ?? '').length}/${limit}`
}

/** @returns whether a text is longer than its limit */
export function overLimit(text: string | undefined, limit: number): boolean {
  return (text ?? '').length > limit
}
