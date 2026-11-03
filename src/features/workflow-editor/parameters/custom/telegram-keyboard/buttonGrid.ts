/** A button of a keyboard sent as one flat list: `newRow` starts a new row, as the bot node expects. */
export interface RowButton {
  newRow?: boolean
}

export interface GridPosition {
  readonly row: number
  readonly column: number
}

export enum MoveDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
}

/** Telegram shows at most this many buttons in a row. */
export const MAX_BUTTONS_PER_ROW = 8

/** A grid after a change, and where the changed button is now. */
export interface GridChange<B extends RowButton> {
  readonly grid: ButtonGrid<B>
  readonly position: GridPosition | null
}

export const samePosition = (a: GridPosition, b: GridPosition): boolean => a.row === b.row && a.column === b.column

/**
 * Buttons as rows, for editing; immutable, every change returns a new grid. `toButtons()` turns it back into the flat
 * list with `newRow` set only where a row starts, so the saved parameters stay minimal.
 */
export class ButtonGrid<B extends RowButton> {
  private constructor(readonly rows: readonly (readonly B[])[]) {}

  static fromButtons<B extends RowButton>(buttons: readonly B[]): ButtonGrid<B> {
    const rows: B[][] = []
    for (const button of buttons) {
      const last = rows.at(-1)
      if (!last || button.newRow) rows.push([button])
      else last.push(button)
    }
    return new ButtonGrid(rows)
  }

  get isEmpty(): boolean {
    return this.rows.length === 0
  }

  toButtons(): B[] {
    return this.rows.flatMap((row, rowIndex) => row.map((button, column) => withRowStart(button, rowIndex > 0 && column === 0)))
  }

  at(position: GridPosition): B | undefined {
    return this.rows[position.row]?.[position.column]
  }

  has(position: GridPosition | null): position is GridPosition {
    return position !== null && this.at(position) !== undefined
  }

  /** @returns where the button is in the flat list */
  indexOf(position: GridPosition): number {
    const before = this.rows.slice(0, position.row).reduce((count, row) => count + row.length, 0)
    return before + position.column
  }

  canAppendTo(row: number): boolean {
    const target = this.rows[row]
    return target !== undefined && target.length < MAX_BUTTONS_PER_ROW
  }

  replace(position: GridPosition, button: B): ButtonGrid<B> {
    return this.mapRow(position.row, (row) => row.map((current, column) => (column === position.column ? button : current)))
  }

  /** Adds a button at the end of a row. */
  append(row: number, button: B): GridChange<B> {
    if (!this.canAppendTo(row)) return { grid: this, position: null }
    const grid = this.mapRow(row, (current) => [...current, button])
    return { grid, position: { row, column: this.rows[row]!.length } }
  }

  /** Adds a row with one button below the others. */
  appendRow(button: B): GridChange<B> {
    return { grid: new ButtonGrid([...this.rows, [button]]), position: { row: this.rows.length, column: 0 } }
  }

  /** Removes a button; a row left empty goes too. */
  remove(position: GridPosition): ButtonGrid<B> {
    return this.mapRow(position.row, (row) => row.filter((_, column) => column !== position.column)).withoutEmptyRows()
  }

  canMove(position: GridPosition, direction: MoveDirection): boolean {
    return this.moved(position, direction) !== null
  }

  /**
   * Moves a button within its row (left, right) or to the end of the row above or below. A button of a shared first or
   * last row moved further out gets a row of its own.
   */
  move(position: GridPosition, direction: MoveDirection): GridChange<B> {
    return this.moved(position, direction) ?? { grid: this, position }
  }

  private moved(position: GridPosition, direction: MoveDirection): GridChange<B> | null {
    const button = this.at(position)
    if (!button) return null
    switch (direction) {
      case MoveDirection.LEFT:
        return this.swapInRow(position, -1)
      case MoveDirection.RIGHT:
        return this.swapInRow(position, 1)
      case MoveDirection.UP:
        return this.toRow(position, button, -1)
      case MoveDirection.DOWN:
        return this.toRow(position, button, 1)
      default: {
        const unknown: never = direction
        throw new Error(`Unknown direction ${String(unknown)}`)
      }
    }
  }

  private swapInRow(position: GridPosition, by: -1 | 1): GridChange<B> | null {
    const row = this.rows[position.row]!
    const target = position.column + by
    if (target < 0 || target >= row.length) return null
    const swapped = [...row]
    ;[swapped[position.column], swapped[target]] = [swapped[target]!, swapped[position.column]!]
    return { grid: this.mapRow(position.row, () => swapped), position: { row: position.row, column: target } }
  }

  private toRow(position: GridPosition, button: B, by: -1 | 1): GridChange<B> | null {
    const target = position.row + by
    const alone = this.rows[position.row]!.length === 1
    if (target < 0 || target >= this.rows.length) {
      return alone ? null : this.toOwnRow(position, button, by)
    }
    if (!this.canAppendTo(target)) return null
    const column = this.rows[target]!.length
    const rows = this.rows.map((row, index) => {
      if (index === target) return [...row, button]
      if (index === position.row) return row.filter((_, c) => c !== position.column)
      return row
    })
    const grid = new ButtonGrid(rows)
    const kept = grid.withoutEmptyRows()
    // The row the button left may have gone, which shifts the target up.
    const row = alone && target > position.row ? target - 1 : target
    return { grid: kept, position: { row, column } }
  }

  private toOwnRow(position: GridPosition, button: B, by: -1 | 1): GridChange<B> {
    const rest = this.rows.map((row, index) => (index === position.row ? row.filter((_, c) => c !== position.column) : row))
    const rows = by < 0 ? [[button], ...rest] : [...rest, [button]]
    return { grid: new ButtonGrid(rows), position: { row: by < 0 ? 0 : rows.length - 1, column: 0 } }
  }

  private mapRow(row: number, change: (buttons: readonly B[]) => readonly B[]): ButtonGrid<B> {
    return new ButtonGrid(this.rows.map((buttons, index) => (index === row ? change(buttons) : buttons)))
  }

  private withoutEmptyRows(): ButtonGrid<B> {
    return new ButtonGrid(this.rows.filter((row) => row.length > 0))
  }
}

/** The button with `newRow` only when it starts a row; the key is left out otherwise. */
function withRowStart<B extends RowButton>(button: B, startsRow: boolean): B {
  const copy: B = { ...button }
  delete copy.newRow
  if (startsRow) copy.newRow = true
  return copy
}
