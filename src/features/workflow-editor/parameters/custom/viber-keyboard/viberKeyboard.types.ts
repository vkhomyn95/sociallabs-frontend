import type { ViberBotActionV1Params } from '@/generated/node-types'

// Mirrors of the Viber Bot node's keyboard enums and field names (nodes/viber/bot/action/operation). The checks at the
// bottom fail compilation when the generated parameter types and these enums drift apart.

/** The `keyboard` parameter of the Viber Bot node. */
export type ViberKeyboardValue = NonNullable<ViberBotActionV1Params['keyboard']>
/** A button of a keyboard or of rich media: both share one shape. */
export type ViberButton = NonNullable<ViberKeyboardValue['buttons']>[number]
type RichMediaButton = NonNullable<ViberBotActionV1Params['richButtons']>[number]

export enum ViberKeyboardType {
  NONE = 'NONE',
  BUTTONS = 'BUTTONS',
  JSON = 'JSON',
}

/** What pressing a button does (`ActionType`). */
export enum ViberButtonAction {
  REPLY = 'REPLY',
  OPEN_URL = 'OPEN_URL',
  LOCATION_PICKER = 'LOCATION_PICKER',
  SHARE_PHONE = 'SHARE_PHONE',
  NONE = 'NONE',
}

/** Names of the keyboard's fields the builder edits or shows itself. */
export enum ViberKeyboardField {
  TYPE = 'type',
  BUTTONS = 'buttons',
  BACKGROUND = 'background',
}

/** Names of a button's fields the builder treats specially. */
export enum ViberButtonField {
  TEXT = 'text',
  ACTION = 'action',
  VALUE = 'value',
  COLUMNS = 'columns',
  ROWS = 'rows',
  BACKGROUND = 'background',
  IMAGE = 'image',
}

/** Names of the rich media fields of the node the rich media builder reads. */
export enum RichMediaField {
  FROM = 'richFrom',
  COLUMNS = 'richColumns',
  ROWS = 'richRows',
  BACKGROUND = 'richBackground',
}

/** The width of a Viber keyboard and the largest card of rich media, in columns. */
export const GRID_COLUMNS = 6
/** The tallest a keyboard button may be, in rows. */
export const MAX_KEYBOARD_BUTTON_ROWS = 2
/** The tallest card of rich media, in rows. */
export const MAX_RICH_MEDIA_ROWS = 7

type Exactly<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type Assert<T extends true> = T

/** Compile-time only: every enum equals the generated union it mirrors. */
export type ViberKeyboardSchemaChecks = [
  Assert<Exactly<`${ViberKeyboardType}`, NonNullable<ViberKeyboardValue['type']>>>,
  Assert<Exactly<`${ViberButtonAction}`, NonNullable<ViberButton['action']>>>,
  Assert<Exactly<ViberButton, RichMediaButton>>,
  Assert<`${ViberKeyboardField}` extends keyof ViberKeyboardValue ? true : false>,
  Assert<`${ViberButtonField}` extends keyof ViberButton ? true : false>,
  Assert<`${RichMediaField}` extends keyof ViberBotActionV1Params ? true : false>,
]
