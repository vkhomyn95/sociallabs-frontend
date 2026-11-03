import {
  MoveDirection,
  withoutIndex,
  type KeyboardLayout,
  type LayoutChange,
} from '../keyboard-common/keyboardLayout'

/** A button sized in grid cells; Viber fills the width when no size is given. */
export interface SizedButton {
  columns?: number
  rows?: number
}

/** @returns how many columns the button takes in a grid of the width, at least one */
export const spanOf = (button: SizedButton, width: number): number => clamp(button.columns ?? width, width)

/** @returns how many rows the button takes, at most `height` */
export const heightOf = (button: SizedButton, height: number): number => clamp(button.rows ?? 1, height)

const clamp = (value: number, max: number): number => Math.min(Math.max(Math.trunc(value), 1), max)

/**
 * Viber's layout: buttons flow in list order into rows of a fixed width, a button that does not fit starting the next
 * row. Order is all there is to edit: left and right swap neighbours, up puts the button at the start of the row
 * above, down at the end of the row below. A new button goes last.
 */
export class FlowLayout<B extends SizedButton> implements KeyboardLayout<B> {
  constructor(private readonly width: number) {}

  /** @returns the indexes of the buttons in each row */
  rows(buttons: readonly B[]): number[][] {
    const rows: number[][] = []
    let used = this.width
    buttons.forEach((button, index) => {
      const span = spanOf(button, this.width)
      if (used + span > this.width) {
        rows.push([])
        used = 0
      }
      rows.at(-1)!.push(index)
      used += span
    })
    return rows
  }

  canMove(buttons: readonly B[], index: number, direction: MoveDirection): boolean {
    return this.target(buttons, index, direction) !== null
  }

  move(buttons: readonly B[], index: number, direction: MoveDirection): LayoutChange<B> {
    const target = this.target(buttons, index, direction)
    if (target === null) return { buttons: [...buttons], selected: index }
    const rest = withoutIndex(buttons, index)
    rest.splice(target, 0, buttons[index]!)
    return { buttons: rest, selected: target }
  }

  /** Rows follow from order, so a new button goes last whatever row it was asked for. */
  add(buttons: readonly B[], button: B): LayoutChange<B> {
    return { buttons: [...buttons, button], selected: buttons.length }
  }

  remove(buttons: readonly B[], index: number): B[] {
    return withoutIndex(buttons, index)
  }

  /** @returns where the button lands in the list without it, null when it cannot go that way */
  private target(buttons: readonly B[], index: number, direction: MoveDirection): number | null {
    if (index < 0 || index >= buttons.length) return null
    switch (direction) {
      case MoveDirection.LEFT:
        return index > 0 ? index - 1 : null
      case MoveDirection.RIGHT:
        return index < buttons.length - 1 ? index + 1 : null
      case MoveDirection.UP:
        return this.startOfRowAbove(buttons, index)
      case MoveDirection.DOWN:
        return this.endOfRowBelow(buttons, index)
      default: {
        const unknown: never = direction
        throw new Error(`Unknown direction ${String(unknown)}`)
      }
    }
  }

  private startOfRowAbove(buttons: readonly B[], index: number): number | null {
    const rows = this.rows(buttons)
    const row = rows.findIndex((indexes) => indexes.includes(index))
    return row > 0 ? rows[row - 1]![0]! : null
  }

  /** The last index of the row below; taking the button out first shifts it onto the button after that one. */
  private endOfRowBelow(buttons: readonly B[], index: number): number | null {
    const rows = this.rows(buttons)
    const row = rows.findIndex((indexes) => indexes.includes(index))
    const below = rows[row + 1]
    return below ? below.at(-1)! : null
  }
}

/**
 * Splits rich media buttons into the cards of the carousel: each card is a grid of `columns` × `rows` cells, and a
 * button that no longer fits the cells left starts the next card.
 *
 * @returns the indexes of the buttons on each card
 */
export function cardsOf(buttons: readonly SizedButton[], columns: number, rows: number): number[][] {
  const capacity = columns * rows
  const cards: number[][] = []
  let used = capacity
  buttons.forEach((button, index) => {
    const area = spanOf(button, columns) * heightOf(button, rows)
    if (used + area > capacity) {
      cards.push([])
      used = 0
    }
    cards.at(-1)!.push(index)
    used += area
  })
  return cards
}
