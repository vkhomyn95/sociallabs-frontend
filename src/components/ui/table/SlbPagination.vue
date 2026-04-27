<template>
  <div class="slb-pagination" :class="`slb-pagination--${size}`">

    <!-- Page size selector -->
    <div class="slb-pagination__size">
      <span class="slb-pagination__size-label">Rows:</span>
      <select
        class="slb-pagination__size-select"
        :value="pageSize"
        @change="onPageSizeChange"
      >
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Info -->
    <span class="slb-pagination__info">
      {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
    </span>

    <!-- Pages -->
    <div class="slb-pagination__pages" role="navigation" aria-label="Pagination">

      <!-- Prev -->
      <button
        class="slb-pagination__btn slb-pagination__btn--icon"
        :disabled="!canPrev"
        aria-label="Previous page"
        @click="$emit('update:page', page - 1)"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <!-- Page buttons -->
      <template v-for="item in pages" :key="item">
        <span v-if="item === 'ellipsis-start' || item === 'ellipsis-end'" class="slb-pagination__ellipsis">
          &hellip;
        </span>
        <button
          v-else
          class="slb-pagination__btn"
          :class="{ 'slb-pagination__btn--active': item === page }"
          :aria-current="item === page ? 'page' : undefined"
          @click="$emit('update:page', item as number)"
        >
          {{ item }}
        </button>
      </template>

      <!-- Next -->
      <button
        class="slb-pagination__btn slb-pagination__btn--icon"
        :disabled="!canNext"
        aria-label="Next page"
        @click="$emit('update:page', page + 1)"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePagination } from './usePagination'
import type { ComponentSize } from '@/components/ui/ui.types'

const props = withDefaults(defineProps<{
  page:      number
  pageSize:  number
  total:     number
  size?:     ComponentSize
  pageSizeOptions?: number[]
}>(), {
  size: 'md',
  pageSizeOptions: () => [10, 20, 50, 100],
})

const emit = defineEmits<{
  'update:page':     [page: number]
  'update:pageSize': [size: number]
}>()

const { totalPages, canPrev, canNext, pages } = usePagination(computed(() => ({
  total:    props.total,
  page:     props.page,
  pageSize: props.pageSize,
})).value)

const rangeStart = computed(() => Math.min((props.page - 1) * props.pageSize + 1, props.total))
const rangeEnd   = computed(() => Math.min(props.page * props.pageSize, props.total))

function onPageSizeChange(event: Event): void {
  const val = Number((event.target as HTMLSelectElement).value)
  emit('update:pageSize', val)
  emit('update:page', 1)
}
</script>

<style lang="scss">
@use './table.scss';
</style>
