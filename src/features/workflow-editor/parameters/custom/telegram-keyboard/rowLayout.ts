import {
  NEW_ROW,
  type AddTarget,
  type KeyboardLayout,
  type LayoutChange,
  type MoveDirection,
} from '../keyboard-common/keyboardLayout'
import { ButtonGrid, type GridChange, type RowButton } from './buttonGrid'

/** Telegram's layout: explicit rows, a button with `newRow` starts one; edits go through {@link ButtonGrid}. */
export class RowLayout<B extends RowButton> implements KeyboardLayout<B> {
  canMove(buttons: readonly B[], index: number, direction: MoveDirection): boolean {
    const grid = ButtonGrid.fromButtons(buttons)
    const position = grid.positionOf(index)
    return position !== null && grid.canMove(position, direction)
  }

  move(buttons: readonly B[], index: number, direction: MoveDirection): LayoutChange<B> {
    const grid = ButtonGrid.fromButtons(buttons)
    const position = grid.positionOf(index)
    if (!position) return { buttons: [...buttons], selected: index }
    return changeOf(grid.move(position, direction))
  }

  add(buttons: readonly B[], button: B, target: AddTarget): LayoutChange<B> {
    const grid = ButtonGrid.fromButtons(buttons)
    if (target === NEW_ROW) return changeOf(grid.appendRow(button))
    return changeOf(grid.append(target, button))
  }

  remove(buttons: readonly B[], index: number): B[] {
    const grid = ButtonGrid.fromButtons(buttons)
    const position = grid.positionOf(index)
    return position ? grid.remove(position).toButtons() : [...buttons]
  }
}

function changeOf<B extends RowButton>(change: GridChange<B>): LayoutChange<B> {
  const selected = change.position ? change.grid.indexOf(change.position) : null
  return { buttons: change.grid.toButtons(), selected }
}
