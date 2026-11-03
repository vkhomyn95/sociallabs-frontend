import type { SlbIconName } from '@sociallabs/frontend-components'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'

export enum MoveDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
}

export const MOVE_DIRECTIONS: readonly MoveDirection[] = Object.values(MoveDirection)

/** The buttons after a change, and the index of the changed button in them; null when none is picked. */
export interface LayoutChange<B> {
  readonly buttons: B[]
  readonly selected: number | null
}

/** Where a new button goes: to the end of a row of the preview, or `NEW_ROW`, below everything. */
export type AddTarget = number | typeof NEW_ROW

export const NEW_ROW = 'NEW_ROW'

/**
 * How a messenger lays out a keyboard kept as one flat list of buttons. The builder works on indexes into that list;
 * the layout decides what a move or an added button does to it. Telegram keeps explicit rows (`newRow`), Viber flows
 * buttons into rows of a fixed width.
 */
export interface KeyboardLayout<B> {
  canMove(buttons: readonly B[], index: number, direction: MoveDirection): boolean
  move(buttons: readonly B[], index: number, direction: MoveDirection): LayoutChange<B>
  add(buttons: readonly B[], button: B, target: AddTarget): LayoutChange<B>
  remove(buttons: readonly B[], index: number): B[]
}

/**
 * What a builder needs to know about one kind of button: how it is laid out, how a new one starts, its icon in the
 * preview, and which of its declared fields the editor offers, adjusted to the button.
 */
export interface ButtonKind<B> {
  readonly layout: KeyboardLayout<B>
  newButton(index: number): B
  icon(button: B): SlbIconName | null
  fields(declared: readonly PropertyDescriptor[], button: B): PropertyDescriptor[]
}

/** @returns the list without the button at the index */
export const withoutIndex = <B>(buttons: readonly B[], index: number): B[] => buttons.filter((_, i) => i !== index)
