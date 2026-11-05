import { describe, expect, it } from 'vitest'
import { MoveDirection } from '../../keyboard-common/keyboardLayout'
import {
  ListPickKind,
  addRow,
  addSection,
  canAddRow,
  moveRow,
  needsTitle,
  removeRow,
  rowCount,
  sectionsOf,
} from '../listSections'
import type { ListSection } from '../whatsappInteractive.types'

const rows = (count: number, from = 1) => Array.from({ length: count }, (_, i) => ({ id: `r${from + i}`, title: `R${from + i}` }))

describe('list sections', () => {
  it('reads saved sections and skips what is not one', () => {
    expect(sectionsOf('{{ $json.sections }}')).toEqual([])
    expect(sectionsOf([{ title: 'A', rows: [{ id: 'a' }, 'x'] }, 3])).toEqual([{ title: 'A', rows: [{ id: 'a' }] }])
  })

  it('adds rows and sections until ten rows in all', () => {
    let sections: ListSection[] = [{ title: 'A', rows: rows(9) }]
    const added = addRow(sections, 0)
    expect(added.pick).toEqual({ kind: ListPickKind.ROW, section: 0, row: 9 })
    sections = added.sections
    expect(rowCount(sections)).toBe(10)
    expect(canAddRow(sections)).toBe(false)
    expect(addRow(sections, 0).sections).toEqual(sections)
    expect(addSection(sections)).toEqual({ sections, pick: null })
  })

  it('adds a section with one row and picks its title', () => {
    const change = addSection([{ rows: rows(2) }])
    expect(change.sections[1]).toEqual({ title: 'Section 2', rows: [{ id: 'row_3', title: 'Row 3' }] })
    expect(change.pick).toEqual({ kind: ListPickKind.SECTION, section: 1 })
  })

  it('moves a row within its section only', () => {
    const sections = [{ title: 'A', rows: rows(2) }, { title: 'B', rows: rows(1, 3) }]
    const down = moveRow(sections, 0, 0, MoveDirection.DOWN)
    expect(down.sections[0]!.rows!.map((row) => row.id)).toEqual(['r2', 'r1'])
    expect(down.pick).toEqual({ kind: ListPickKind.ROW, section: 0, row: 1 })
    expect(moveRow(sections, 0, 1, MoveDirection.DOWN).sections).toEqual(sections)
    expect(moveRow(sections, 1, 0, MoveDirection.UP).sections).toEqual(sections)
  })

  it('drops a section with its last row', () => {
    const sections = [{ title: 'A', rows: rows(1) }, { title: 'B', rows: rows(2, 2) }]
    expect(removeRow(sections, 0, 0)).toEqual([{ title: 'B', rows: rows(2, 2) }])
    expect(removeRow(sections, 1, 0)).toEqual([{ title: 'A', rows: rows(1) }, { title: 'B', rows: rows(1, 3) }])
  })

  it('needs section titles only when there are several sections', () => {
    expect(needsTitle([{ rows: rows(1) }], 0)).toBe(false)
    expect(needsTitle([{ rows: rows(1) }, { title: 'B', rows: rows(1) }], 0)).toBe(true)
    expect(needsTitle([{ rows: rows(1) }, { title: 'B', rows: rows(1) }], 1)).toBe(false)
  })
})
