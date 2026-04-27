import { computed, ref, watch } from 'vue'
import type { TableColumn, TableProps, SortState, SortDirection } from './table.types'

export function useTable<T extends Record<string, any>>(props: TableProps<T>) {

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const sortState = ref<SortState>({ key: null, direction: null })

  function toggleSort(column: TableColumn<T>): void {
    if (!column.sortable) return

    if (sortState.value.key !== column.key) {
      sortState.value = { key: column.key, direction: 'asc' }
      return
    }

    const next: Record<string, SortDirection> = { asc: 'desc', desc: null, '': 'asc' }
    const nextDir = next[sortState.value.direction ?? ''] ?? 'asc'
    sortState.value = { key: nextDir ? column.key : null, direction: nextDir }
  }

  // ─── Selection ──────────────────────────────────────────────────────────────
  const selectedKeys = ref<Set<string | number>>(new Set())

  const rowKey = computed(() => props.rowKey ?? 'id')

  function getRowKey(row: T): string | number {
    return row[rowKey.value]
  }

  const isAllSelected = computed((): boolean => {
    if (!props.data.length) return false
    return props.data.every(row => selectedKeys.value.has(getRowKey(row)))
  })

  const isIndeterminate = computed((): boolean => {
    const count = props.data.filter(row => selectedKeys.value.has(getRowKey(row))).length
    return count > 0 && count < props.data.length
  })

  function toggleRow(row: T): void {
    const key = getRowKey(row)
    if (selectedKeys.value.has(key)) {
      selectedKeys.value.delete(key)
    } else {
      selectedKeys.value.add(key)
    }
  }

  function toggleAll(): void {
    if (isAllSelected.value) {
      props.data.forEach(row => selectedKeys.value.delete(getRowKey(row)))
    } else {
      props.data.forEach(row => selectedKeys.value.add(getRowKey(row)))
    }
  }

  function isRowSelected(row: T): boolean {
    return selectedKeys.value.has(getRowKey(row))
  }

  const selectedRows = computed((): T[] =>
    props.data.filter(row => selectedKeys.value.has(getRowKey(row)))
  )

  // Reset selection when data changes
  watch(() => props.data, () => {
    selectedKeys.value.clear()
  })

  // ─── Column styles ──────────────────────────────────────────────────────────
  function getColumnStyle(col: TableColumn<T>): Record<string, string> {
    const style: Record<string, string> = {}
    if (col.width)    style.width    = col.width
    if (col.minWidth) style.minWidth = col.minWidth
    return style
  }

  function getSortIcon(col: TableColumn<T>): string {
    if (!col.sortable) return ''
    if (sortState.value.key !== col.key) return 'fa-solid fa-sort'
    if (sortState.value.direction === 'asc')  return 'fa-solid fa-sort-up'
    if (sortState.value.direction === 'desc') return 'fa-solid fa-sort-down'
    return 'fa-solid fa-sort'
  }

  function getSortActive(col: TableColumn<T>): boolean {
    return sortState.value.key === col.key && sortState.value.direction !== null
  }

  return {
    sortState,
    toggleSort,
    selectedKeys,
    selectedRows,
    isAllSelected,
    isIndeterminate,
    toggleRow,
    toggleAll,
    isRowSelected,
    getColumnStyle,
    getSortIcon,
    getSortActive,
  }
}
