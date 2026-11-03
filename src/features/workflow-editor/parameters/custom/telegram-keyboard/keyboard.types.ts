import type { TelegramBotActionV2Params } from '@/generated/node-types'

// Mirrors of the bot node's keyboard enums (nodes/telegram/bot/action/operation). The checks at the bottom fail
// compilation when the generated parameter types and these enums drift apart.

/** The `keyboard` parameter of the Telegram Bot node. */
export type KeyboardValue = NonNullable<TelegramBotActionV2Params['keyboard']>
export type InlineButton = NonNullable<KeyboardValue['inlineButtons']>[number]
export type ReplyButton = NonNullable<KeyboardValue['replyButtons']>[number]
export type BotOperation = TelegramBotActionV2Params['operation']

export enum KeyboardType {
  NONE = 'NONE',
  INLINE = 'INLINE',
  REPLY = 'REPLY',
  REMOVE = 'REMOVE',
  FORCE_REPLY = 'FORCE_REPLY',
  JSON = 'JSON',
}

/** What pressing an inline button does. */
export enum InlineAction {
  CALLBACK = 'CALLBACK',
  URL = 'URL',
  SWITCH_INLINE = 'SWITCH_INLINE',
  SWITCH_INLINE_HERE = 'SWITCH_INLINE_HERE',
  COPY_TEXT = 'COPY_TEXT',
  PAY = 'PAY',
}

/** What pressing a reply button sends. */
export enum ReplyRequest {
  TEXT = 'TEXT',
  CONTACT = 'CONTACT',
  LOCATION = 'LOCATION',
}

/** Names of the keyboard's fields the builder edits or shows itself. */
export enum KeyboardField {
  TYPE = 'type',
  INLINE_BUTTONS = 'inlineButtons',
  REPLY_BUTTONS = 'replyButtons',
}

/** Names of a button's fields the builder treats specially. */
export enum ButtonField {
  TEXT = 'text',
  ACTION = 'action',
  REQUEST = 'request',
  VALUE = 'value',
  NEW_ROW = 'newRow',
}

type Exactly<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type Assert<T extends true> = T

/** Compile-time only: every enum equals the generated union it mirrors. */
export type KeyboardSchemaChecks = [
  Assert<Exactly<`${KeyboardType}`, NonNullable<KeyboardValue['type']>>>,
  Assert<Exactly<`${InlineAction}`, NonNullable<InlineButton['action']>>>,
  Assert<Exactly<`${ReplyRequest}`, NonNullable<ReplyButton['request']>>>,
  Assert<`${KeyboardField}` extends keyof KeyboardValue ? true : false>,
  Assert<`${ButtonField}` extends keyof InlineButton | keyof ReplyButton ? true : false>,
]
