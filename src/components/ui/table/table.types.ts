import type { ComponentSize } from '@/components/ui/ui.types'

// ─── Column definition ────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null

export interface TableColumn<T = any> {
  key: string
  label: string
  width?: string          // напр. '120px' або '20%'
  minWidth?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  // Кастомний рендер через slot: #cell-[key]
}

// ─── Sort state ───────────────────────────────────────────────────────────────

export interface SortState {
  key: string | null
  direction: SortDirection
}

// ─── Scroll mode ──────────────────────────────────────────────────────────────

export type TableScrollMode = 'pagination' | 'infinite'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: string                      // унікальний ключ рядка, default 'id'
  size?: ComponentSize
  loading?: boolean
  selectable?: boolean                 // чекбокси
  scrollMode?: TableScrollMode

  // Pagination mode
  total?: number
  page?: number
  pageSize?: number

  // Infinite scroll mode
  hasMore?: boolean

  // Empty state
  emptyText?: string
  emptyIcon?: string

  // Стрипи / бордери
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
}

// ─── Emits ────────────────────────────────────────────────────────────────────

export interface TableEmits<T = any> {
  'update:page': [page: number]
  'update:pageSize': [size: number]
  'sort': [state: SortState]
  'row-click': [row: T, index: number]
  'select': [rows: T[]]
  'load-more': []
}
