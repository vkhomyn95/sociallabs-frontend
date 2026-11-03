import { describe, expect, it } from 'vitest'
import { MoveDirection, NEW_ROW, type KeyboardLayout } from '../../keyboard-common/keyboardLayout'
import { cardsOf, FlowLayout, type SizedButton } from '../flowLayout'

interface Button extends SizedButton {
  text: string
}

const b = (text: string, columns?: number, rows?: number): Button => ({ text, columns, rows })
const texts = (buttons: readonly Button[]) => buttons.map((button) => button.text)

const layout = new FlowLayout<Button>(6)
// [A3 B3] / [C6] / [D2 E2]
const buttons = [b('A', 3), b('B', 3), b('C'), b('D', 2), b('E', 2)]

describe('FlowLayout', () => {
  it('fills rows of six columns in order, a full-width button when no width is given', () => {
    expect(layout.rows(buttons)).toEqual([[0, 1], [2], [3, 4]])
    expect(layout.rows([b('A', 4), b('B', 4), b('C', 9)])).toEqual([[0], [1], [2]])
  })

  it('swaps neighbours left and right, not past the ends', () => {
    expect(texts(layout.move(buttons, 1, MoveDirection.LEFT).buttons)).toEqual(['B', 'A', 'C', 'D', 'E'])
    expect(layout.move(buttons, 3, MoveDirection.RIGHT)).toMatchObject({ selected: 4 })
    expect(layout.canMove(buttons, 0, MoveDirection.LEFT)).toBe(false)
    expect(layout.canMove(buttons, 4, MoveDirection.RIGHT)).toBe(false)
  })

  it('moves up to the start of the row above and down to the end of the row below', () => {
    const up = layout.move(buttons, 3, MoveDirection.UP)
    expect(texts(up.buttons)).toEqual(['A', 'B', 'D', 'C', 'E'])
    expect(up.selected).toBe(2)

    const down = layout.move(buttons, 0, MoveDirection.DOWN)
    expect(texts(down.buttons)).toEqual(['B', 'C', 'A', 'D', 'E'])
    expect(down.selected).toBe(2)

    expect(layout.canMove(buttons, 1, MoveDirection.UP)).toBe(false)
    expect(layout.canMove(buttons, 4, MoveDirection.DOWN)).toBe(false)
  })

  it('adds last whatever row is asked for, and removes by index', () => {
    const builder: KeyboardLayout<Button> = layout
    expect(builder.add(buttons, b('X'), NEW_ROW)).toMatchObject({ selected: 5 })
    expect(texts(builder.add(buttons, b('X'), 0).buttons).at(-1)).toBe('X')
    expect(texts(layout.remove(buttons, 2))).toEqual(['A', 'B', 'D', 'E'])
  })
})

describe('cardsOf', () => {
  it('starts a new card when a button no longer fits the cells left', () => {
    // 6 × 2 cards: A takes a full row, B and C half a row each, D a full row → the third row starts card 2.
    const cards = cardsOf([b('A', 6), b('B', 3), b('C', 3), b('D', 6, 1)], 6, 2)
    expect(cards).toEqual([[0, 1, 2], [3]])
  })

  it('clamps buttons wider or higher than a card to its size', () => {
    expect(cardsOf([b('A', 6, 7), b('B', 6, 7)], 3, 2)).toEqual([[0], [1]])
  })
})

describe('Viber preview colors', () => {
  it('takes hex colors only, and white text on dark ones', async () => {
    const { previewColor, textColorOn } = await import('../viberPreview')
    expect(previewColor(' #7360f2 ')).toBe('#7360f2')
    expect(previewColor('{{ $json.color }}')).toBeUndefined()
    expect(textColorOn('#7360f2')).toBe('#fff')
    expect(textColorOn('#fff')).toBeUndefined()
    expect(textColorOn(undefined)).toBeUndefined()
  })
})
