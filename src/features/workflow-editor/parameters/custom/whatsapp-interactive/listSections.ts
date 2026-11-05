import { isRecord } from '@/core/node-types/parameters'
import { MoveDirection } from '../keyboard-common/keyboardLayout'
import { WhatsAppLimit, type ListRow, type ListSection } from './whatsappInteractive.types'

/** What is picked in a list: a section's title, or one of its rows. */
export enum ListPickKind {
  SECTION = 'SECTION',
  ROW = 'ROW',
}

export type ListPick =
  | { readonly kind: ListPickKind.SECTION; readonly section: number }
  | { readonly kind: ListPickKind.ROW; readonly section: number; readonly row: number }

/** The sections after a change, and what is picked in them; null when nothing is. */
export interface ListChange {
  readonly sections: ListSection[]
  readonly pick: ListPick | null
}

/** @returns the saved sections, skipping anything that is not a section (an expression, a stray value) */
export function sectionsOf(value: unknown): ListSection[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((section) => ({ ...section, rows: rowsOf(section.rows) }))
}

function rowsOf(value: unknown): ListRow[] {
  return Array.isArray(value) ? (value.filter(isRecord) as ListRow[]) : []
}

/** @returns how many rows the list has in all; WhatsApp takes ten */
export function rowCount(sections: readonly ListSection[]): number {
  return sections.reduce((count, section) => count + (section.rows?.length ?? 0), 0)
}

/** @returns whether another row fits */
export const canAddRow = (sections: readonly ListSection[]): boolean => rowCount(sections) < WhatsAppLimit.LIST_ROWS

/** @returns whether a section has no title although WhatsApp needs one, as it does when there are several */
export const needsTitle = (sections: readonly ListSection[], section: number): boolean =>
  sections.length > 1 && !sections[section]?.title?.trim()

const newRow = (number: number): ListRow => ({ id: `row_${number}`, title: `Row ${number}` })

/** Adds a section with one row, when another row fits; picks its title. */
export function addSection(sections: readonly ListSection[]): ListChange {
  if (!canAddRow(sections)) return { sections: [...sections], pick: null }
  const number = sections.length + 1
  const next = [...sections, { title: `Section ${number}`, rows: [newRow(rowCount(sections) + 1)] }]
  return { sections: next, pick: { kind: ListPickKind.SECTION, section: sections.length } }
}

/** Adds a row at the end of the section, when another row fits; picks it. */
export function addRow(sections: readonly ListSection[], section: number): ListChange {
  const target = sections[section]
  if (!target || !canAddRow(sections)) return { sections: [...sections], pick: null }
  const rows = [...(target.rows ?? []), newRow(rowCount(sections) + 1)]
  return {
    sections: withSection(sections, section, { ...target, rows }),
    pick: { kind: ListPickKind.ROW, section, row: rows.length - 1 },
  }
}

/** @returns whether the row can move that way: up and down within its section */
export function canMoveRow(sections: readonly ListSection[], section: number, row: number, direction: MoveDirection): boolean {
  const rows = sections[section]?.rows ?? []
  switch (direction) {
    case MoveDirection.UP:
      return row > 0 && row < rows.length
    case MoveDirection.DOWN:
      return row >= 0 && row < rows.length - 1
    case MoveDirection.LEFT:
    case MoveDirection.RIGHT:
      return false
  }
}

export function moveRow(sections: readonly ListSection[], section: number, row: number, direction: MoveDirection): ListChange {
  const pick: ListPick = { kind: ListPickKind.ROW, section, row }
  if (!canMoveRow(sections, section, row, direction)) return { sections: [...sections], pick }
  const target = direction === MoveDirection.UP ? row - 1 : row + 1
  const rows = [...(sections[section]!.rows ?? [])]
  ;[rows[row], rows[target]] = [rows[target]!, rows[row]!]
  return {
    sections: withSection(sections, section, { ...sections[section]!, rows }),
    pick: { kind: ListPickKind.ROW, section, row: target },
  }
}

/** Removes a row; a section left without rows goes too, since WhatsApp takes no empty section. */
export function removeRow(sections: readonly ListSection[], section: number, row: number): ListSection[] {
  const target = sections[section]
  if (!target) return [...sections]
  const rows = (target.rows ?? []).filter((_, index) => index !== row)
  if (!rows.length) return removeSection(sections, section)
  return withSection(sections, section, { ...target, rows })
}

export function removeSection(sections: readonly ListSection[], section: number): ListSection[] {
  return sections.filter((_, index) => index !== section)
}

/** @returns the sections with one replaced */
export function withSection(sections: readonly ListSection[], index: number, section: ListSection): ListSection[] {
  return sections.map((existing, i) => (i === index ? section : existing))
}

/** @returns the sections with one row replaced */
export function withRow(sections: readonly ListSection[], section: number, row: number, value: ListRow): ListSection[] {
  const target = sections[section]
  if (!target) return [...sections]
  const rows = (target.rows ?? []).map((existing, i) => (i === row ? value : existing))
  return withSection(sections, section, { ...target, rows })
}
