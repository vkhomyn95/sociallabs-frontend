import { describe, expect, it } from 'vitest'
import { ButtonGrid, MAX_BUTTONS_PER_ROW, MoveDirection } from '../buttonGrid'

interface Button {
  text: string
  newRow?: boolean
}

const b = (text: string, newRow?: boolean): Button => (newRow ? { text, newRow } : { text })
const texts = (grid: ButtonGrid<Button>) => grid.rows.map((row) => row.map((button) => button.text))

// [A B] / [C] / [D E]
const grid = () => ButtonGrid.fromButtons([b('A'), b('B'), b('C', true), b('D', true), b('E')])

describe('ButtonGrid', () => {
  it('reads rows from the flat list, a first button needing no newRow', () => {
    expect(texts(grid())).toEqual([['A', 'B'], ['C'], ['D', 'E']])
    expect(texts(ButtonGrid.fromButtons([b('A', true), b('B')]))).toEqual([['A', 'B']])
  })

  it('writes newRow only where a row starts', () => {
    const buttons = ButtonGrid.fromButtons([b('A', true), { text: 'B', newRow: false }, b('C', true)]).toButtons()
    expect(buttons).toEqual([{ text: 'A' }, { text: 'B' }, { text: 'C', newRow: true }])
  })

  it('appends to a row and as a new row, pointing at the new button', () => {
    const toRow = grid().append(1, b('X'))
    expect(texts(toRow.grid)).toEqual([['A', 'B'], ['C', 'X'], ['D', 'E']])
    expect(toRow.position).toEqual({ row: 1, column: 1 })

    const newRow = grid().appendRow(b('Y'))
    expect(texts(newRow.grid).at(-1)).toEqual(['Y'])
    expect(newRow.position).toEqual({ row: 3, column: 0 })
  })

  it('refuses a button over the row limit', () => {
    const full = ButtonGrid.fromButtons(Array.from({ length: MAX_BUTTONS_PER_ROW }, (_, i) => b(`B${i}`)))
    expect(full.canAppendTo(0)).toBe(false)
    expect(full.append(0, b('X')).position).toBeNull()
  })

  it('removes a button and the row it leaves empty', () => {
    expect(texts(grid().remove({ row: 1, column: 0 }))).toEqual([['A', 'B'], ['D', 'E']])
  })

  it('moves within a row', () => {
    const moved = grid().move({ row: 0, column: 0 }, MoveDirection.RIGHT)
    expect(texts(moved.grid)[0]).toEqual(['B', 'A'])
    expect(moved.position).toEqual({ row: 0, column: 1 })
    expect(grid().canMove({ row: 0, column: 0 }, MoveDirection.LEFT)).toBe(false)
  })

  it('moves to the end of the row above or below; an emptied row goes and the position follows', () => {
    const down = grid().move({ row: 1, column: 0 }, MoveDirection.DOWN)
    expect(texts(down.grid)).toEqual([['A', 'B'], ['D', 'E', 'C']])
    expect(down.position).toEqual({ row: 1, column: 2 })

    const up = grid().move({ row: 2, column: 1 }, MoveDirection.UP)
    expect(texts(up.grid)).toEqual([['A', 'B'], ['C', 'E'], ['D']])
    expect(up.position).toEqual({ row: 1, column: 1 })
  })

  it('gives a button of a shared outer row a row of its own, but not a lone one', () => {
    const up = grid().move({ row: 0, column: 1 }, MoveDirection.UP)
    expect(texts(up.grid)).toEqual([['B'], ['A'], ['C'], ['D', 'E']])
    expect(up.position).toEqual({ row: 0, column: 0 })

    const down = grid().move({ row: 2, column: 0 }, MoveDirection.DOWN)
    expect(texts(down.grid)).toEqual([['A', 'B'], ['C'], ['E'], ['D']])
    expect(down.position).toEqual({ row: 3, column: 0 })

    const single = ButtonGrid.fromButtons([b('A')])
    expect(single.canMove({ row: 0, column: 0 }, MoveDirection.UP)).toBe(false)
    expect(single.canMove({ row: 0, column: 0 }, MoveDirection.DOWN)).toBe(false)
  })

  it('finds a button in the flat list', () => {
    expect(grid().indexOf({ row: 2, column: 1 })).toBe(4)
  })
})
