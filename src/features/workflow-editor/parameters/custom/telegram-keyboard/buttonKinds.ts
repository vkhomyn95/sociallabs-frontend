import type { SlbIconName } from '@sociallabs/frontend-components'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import type { RowButton } from './buttonGrid'
import {
  ButtonField,
  InlineAction,
  KeyboardField,
  KeyboardType,
  ReplyRequest,
  type InlineButton,
  type ReplyButton,
} from './keyboard.types'

/** How the value field of an inline button reads for its action; the backend declares one generic field. */
interface InlineActionUi {
  readonly icon: SlbIconName | null
  /** Null when the action takes no value. */
  readonly value: { readonly label: string; readonly placeholder: string; readonly hint: string } | null
}

const INLINE_ACTION_UI: Readonly<Record<InlineAction, InlineActionUi>> = {
  [InlineAction.CALLBACK]: {
    icon: null,
    value: { label: 'Callback data', placeholder: 'buy:42', hint: 'Up to 64 bytes; empty sends the button text' },
  },
  [InlineAction.URL]: {
    icon: 'action_external',
    value: { label: 'URL', placeholder: 'https://example.com', hint: 'http(s):// or tg:// link' },
  },
  [InlineAction.SWITCH_INLINE]: {
    icon: 'chat_forward',
    value: { label: 'Inline query', placeholder: 'search text', hint: 'The user picks a chat, then @bot and this query are typed there' },
  },
  [InlineAction.SWITCH_INLINE_HERE]: {
    icon: 'action_search',
    value: { label: 'Inline query', placeholder: 'search text', hint: '@bot and this query are typed in the current chat' },
  },
  [InlineAction.COPY_TEXT]: {
    icon: 'action_copy',
    value: { label: 'Text to copy', placeholder: 'PROMO2026', hint: 'Copied to the clipboard on a press' },
  },
  [InlineAction.PAY]: { icon: 'action_star', value: null },
}

const REPLY_REQUEST_ICONS: Readonly<Record<ReplyRequest, SlbIconName | null>> = {
  [ReplyRequest.TEXT]: null,
  [ReplyRequest.CONTACT]: 'object_phone',
  [ReplyRequest.LOCATION]: 'object_globe',
}

/**
 * What differs between inline and reply buttons: the list they are kept in, how a new one starts, how it shows in
 * the preview, and which of its declared fields the editor offers.
 */
export interface ButtonKind<B extends RowButton> {
  readonly keyboardType: KeyboardType.INLINE | KeyboardType.REPLY
  readonly list: KeyboardField.INLINE_BUTTONS | KeyboardField.REPLY_BUTTONS
  readonly newButton: (index: number) => B
  readonly icon: (button: B) => SlbIconName | null
  /** The declared fields to edit for this button, without `newRow` (the grid sets it). */
  readonly fields: (declared: readonly PropertyDescriptor[], button: B) => PropertyDescriptor[]
}

const withoutRowFlag = (declared: readonly PropertyDescriptor[]): PropertyDescriptor[] =>
  declared.filter((property) => property.name !== ButtonField.NEW_ROW)

const actionOf = (button: InlineButton): InlineAction => (button.action as InlineAction | undefined) ?? InlineAction.CALLBACK

const requestOf = (button: ReplyButton): ReplyRequest => (button.request as ReplyRequest | undefined) ?? ReplyRequest.TEXT

export const INLINE_BUTTONS: ButtonKind<InlineButton> = {
  keyboardType: KeyboardType.INLINE,
  list: KeyboardField.INLINE_BUTTONS,
  newButton: (index) => ({ text: `Button ${index}`, action: InlineAction.CALLBACK }),
  icon: (button) => INLINE_ACTION_UI[actionOf(button)].icon,
  fields(declared, button) {
    const value = INLINE_ACTION_UI[actionOf(button)].value
    return withoutRowFlag(declared).flatMap((property) => {
      if (property.name !== ButtonField.VALUE) return [property]
      if (!value) return []
      return [{ ...property, displayName: value.label, placeholder: value.placeholder, description: value.hint }]
    })
  },
}

export const REPLY_BUTTONS: ButtonKind<ReplyButton> = {
  keyboardType: KeyboardType.REPLY,
  list: KeyboardField.REPLY_BUTTONS,
  newButton: (index) => ({ text: `Button ${index}`, request: ReplyRequest.TEXT }),
  icon: (button) => REPLY_REQUEST_ICONS[requestOf(button)],
  fields: (declared) => withoutRowFlag(declared),
}
