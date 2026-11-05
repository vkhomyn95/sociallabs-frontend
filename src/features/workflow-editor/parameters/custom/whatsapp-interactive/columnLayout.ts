import {
  MoveDirection,
  withoutIndex,
  type KeyboardLayout,
  type LayoutChange,
} from '../keyboard-common/keyboardLayout'

/**
 * Buttons one under another, up to a limit, as WhatsApp shows reply buttons. Moves go up and down; an added button goes
 * to the end, and none is added past the limit.
 */
export class ColumnLayout<B> implements KeyboardLayout<B> {
  constructor(private readonly limit: number) {}

  /** @returns whether another button may be added */
  canAdd(buttons: readonly B[]): boolean {
    return buttons.length < this.limit
  }

  canMove(buttons: readonly B[], index: number, direction: MoveDirection): boolean {
    switch (direction) {
      case MoveDirection.UP:
        return index > 0 && index < buttons.length
      case MoveDirection.DOWN:
        return index >= 0 && index < buttons.length - 1
      case MoveDirection.LEFT:
      case MoveDirection.RIGHT:
        return false
    }
  }

  move(buttons: readonly B[], index: number, direction: MoveDirection): LayoutChange<B> {
    if (!this.canMove(buttons, index, direction)) return { buttons: [...buttons], selected: index }
    const target = direction === MoveDirection.UP ? index - 1 : index + 1
    const next = [...buttons]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    return { buttons: next, selected: target }
  }

  /** Takes no target: a column has one place to add to. */
  add(buttons: readonly B[], button: B): LayoutChange<B> {
    if (!this.canAdd(buttons)) return { buttons: [...buttons], selected: null }
    return { buttons: [...buttons, button], selected: buttons.length }
  }

  remove(buttons: readonly B[], index: number): B[] {
    return withoutIndex(buttons, index)
  }
}
