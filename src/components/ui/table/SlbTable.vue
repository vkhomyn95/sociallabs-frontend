<template>
  <div
    class="slb-table"
    :class="[
      `slb-table--${size}`,
      { 'slb-table--striped':  striped  },
      { 'slb-table--bordered': bordered },
      { 'slb-table--hoverable': hoverable !== false },
      { 'slb-table--loading':  loading  },
    ]"
  >
    <!-- Wrapper з overflow -->
    <div class="slb-table__wrapper" ref="wrapperRef">
      <table class="slb-table__el" role="grid">

        <!-- Head -->
        <thead class="slb-table__head">
        <tr>
          <!-- Checkbox col -->
          <th v-if="selectable" class="slb-table__th slb-table__th--check">
            <input
              type="checkbox"
              class="slb-table__checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              aria-label="Select all"
              @change="onToggleAll"
            />
          </th>

          <!-- Data columns -->
          <th
            v-for="col in columns"
            :key="col.key"
            class="slb-table__th"
            :class="[
                `slb-table__th--${col.align ?? 'left'}`,
                { 'slb-table__th--sortable': col.sortable },
                { 'slb-table__th--sorted': getSortActive(col) },
              ]"
            :style="getColumnStyle(col)"
            :aria-sort="getSortAriaLabel(col)"
            @click="onSort(col)"
          >
              <span class="slb-table__th-content">
                <slot :name="`header-${col.key}`" :column="col">
                  {{ col.label }}
                </slot>
                <i
                  v-if="col.sortable"
                  :class="getSortIcon(col)"
                  class="slb-table__sort-icon"
                  aria-hidden="true"
                ></i>
              </span>
          </th>
        </tr>
        </thead>

        <!-- Body -->
        <tbody class="slb-table__body">

        <!-- Rows -->
        <template v-if="!loading && data.length > 0">
          <tr
            v-for="(row, rowIndex) in data"
            :key="getRowKeyValue(row)"
            class="slb-table__row"
            :class="{ 'slb-table__row--selected': isRowSelected(row) }"
            @click="onRowClick(row, rowIndex)"
          >
            <td v-if="selectable" class="slb-table__td slb-table__td--check" @click.stop>
              <input
                type="checkbox"
                class="slb-table__checkbox"
                :checked="isRowSelected(row)"
                :aria-label="`Select row ${rowIndex + 1}`"
                @change="onToggleRow(row)"
              />
            </td>

            <td
              v-for="col in columns"
              :key="col.key"
              class="slb-table__td"
              :class="`slb-table__td--${col.align ?? 'left'}`"
              :style="getColumnStyle(col)"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="rowIndex">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="!loading && data.length === 0" class="slb-table__row--empty">
          <td :colspan="selectable ? columns.length + 1 : columns.length">
            <slot name="empty">
              <div class="slb-table__empty">
                <i :class="emptyIcon ?? 'fas fa-inbox'" aria-hidden="true"></i>
                <p>{{ emptyText ?? 'No data available' }}</p>
              </div>
            </slot>
          </td>
        </tr>

        <!-- Skeleton rows while loading -->
        <template v-else-if="loading && data.length === 0">
          <tr v-for="i in skeletonRows" :key="`skel-${i}`" class="slb-table__row slb-table__row--skeleton">
            <td v-if="selectable" class="slb-table__td slb-table__td--check">
              <span class="slb-table__skeleton-cell"></span>
            </td>
            <td v-for="col in columns" :key="col.key" class="slb-table__td">
              <span class="slb-table__skeleton-cell" :style="{ width: skeletonWidth() }"></span>
            </td>
          </tr>
        </template>

        </tbody>
      </table>

      <!-- Infinite scroll sentinel -->
      <div
        v-if="scrollMode === 'infinite'"
        ref="sentinelRef"
        class="slb-table__sentinel"
        aria-hidden="true"
      />

      <!-- Infinite scroll loader -->
      <div v-if="scrollMode === 'infinite' && loading && data.length > 0" class="slb-table__infinite-loader">
        <span class="slb-table__spinner"></span>
        <span>Loading more...</span>
      </div>

      <!-- Overlay loader (pagination mode) -->
      <Transition name="slb-table-overlay">
        <div v-if="loading && scrollMode !== 'infinite'" class="slb-table__overlay" aria-live="polite" aria-label="Loading">
          <span class="slb-table__spinner slb-table__spinner--lg"></span>
        </div>
      </Transition>
    </div>

    <!-- Pagination -->
    <div v-if="scrollMode === 'pagination' && total" class="slb-table__footer">
      <SlbPagination
        :page="page ?? 1"
        :page-size="pageSize ?? 20"
        :total="total"
        :size="size"
        @update:page="$emit('update:page', $event)"
        @update:page-size="$emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTable } from './useTable'
import type { TableColumn, TableProps, SortState } from './table.types'
import SlbPagination from './SlbPagination.vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<TableProps<T>>(), {
  rowKey:     'id',
  size:       'md',
  scrollMode: 'pagination',
  loading:    false,
  selectable: false,
  striped:    false,
  bordered:   false,
  hoverable:  true,
  emptyText:  'No data available',
  page:       1,
  pageSize:   20,
})

const emit = defineEmits<{
  'update:page':     [page: number]
  'update:pageSize': [size: number]
  'sort':            [state: SortState]
  'row-click':       [row: T, index: number]
  'select':          [rows: T[]]
  'load-more':       []
}>()

// ─── Composable ───────────────────────────────────────────────────────────────
const {
  sortState,
  toggleSort,
  selectedRows,
  isAllSelected,
  isIndeterminate,
  toggleRow,
  toggleAll,
  isRowSelected,
  getColumnStyle,
  getSortIcon,
  getSortActive,
} = useTable(props)

// ─── Refs ─────────────────────────────────────────────────────────────────────
const wrapperRef  = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const skeletonRows = computed(() => props.pageSize ?? 5)

function skeletonWidth(): string {
  const widths = ['60%', '75%', '50%', '85%', '65%']
  return widths[Math.floor(Math.random() * widths.length)]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRowKeyValue(row: T): string | number {
  return row[props.rowKey ?? 'id']
}

function getSortAriaLabel(col: TableColumn<T>): string | undefined {
  if (!col.sortable) return undefined
  if (sortState.value.key !== col.key) return 'none'
  return sortState.value.direction === 'asc' ? 'ascending' : 'descending'
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
function onSort(col: TableColumn<T>): void {
  if (!col.sortable) return
  toggleSort(col)
  emit('sort', sortState.value)
}

function onRowClick(row: T, index: number): void {
  emit('row-click', row, index)
}

function onToggleRow(row: T): void {
  toggleRow(row)
  emit('select', selectedRows.value)
}

function onToggleAll(): void {
  toggleAll()
  emit('select', selectedRows.value)
}

// ─── Infinite scroll via IntersectionObserver ──────────────────────────────
let observer: IntersectionObserver | null = null

function setupObserver(): void {
  if (props.scrollMode !== 'infinite' || !sentinelRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.loading) {
        emit('load-more')
      }
    },
    { threshold: 0.1 }
  )
  observer.observe(sentinelRef.value)
}

function destroyObserver(): void {
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  if (props.scrollMode === 'infinite') setupObserver()
})

onBeforeUnmount(destroyObserver)

watch(() => props.scrollMode, (val) => {
  destroyObserver()
  if (val === 'infinite') setupObserver()
})
</script>

<style lang="scss">
@use './table.scss';
</style>
