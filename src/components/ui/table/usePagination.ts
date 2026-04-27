import { computed, ref } from 'vue'

export interface UsePaginationProps {
  total: number
  page: number
  pageSize: number
  siblingCount?: number   // кількість сторінок по обидва боки від поточної
}

export function usePagination(props: UsePaginationProps) {
  const siblingCount = computed(() => props.siblingCount ?? 1)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(props.total / props.pageSize))
  )

  const canPrev = computed(() => props.page > 1)
  const canNext = computed(() => props.page < totalPages.value)

  // ─── Page range з ellipsis ─────────────────────────────────────────────────
  // Повертає масив: числа | 'ellipsis-start' | 'ellipsis-end'
  const pages = computed((): Array<number | 'ellipsis-start' | 'ellipsis-end'> => {
    const total = totalPages.value
    const current = props.page
    const siblings = siblingCount.value

    // Якщо сторінок мало — показуємо всі
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const leftSibling  = Math.max(current - siblings, 1)
    const rightSibling = Math.min(current + siblings, total)

    const showLeftEllipsis  = leftSibling > 2
    const showRightEllipsis = rightSibling < total - 1

    if (!showLeftEllipsis && showRightEllipsis) {
      // [1, 2, 3, 4, 5, ..., N]
      const leftPages = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1)
      return [...leftPages, 'ellipsis-end', total]
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      // [1, ..., N-4, N-3, N-2, N-1, N]
      const rightCount = 3 + siblings * 2
      const rightPages = Array.from({ length: rightCount }, (_, i) => total - rightCount + i + 1)
      return [1, 'ellipsis-start', ...rightPages]
    }

    // [1, ..., L, C, R, ..., N]
    const middlePages = Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i
    )
    return [1, 'ellipsis-start', ...middlePages, 'ellipsis-end', total]
  })

  return {
    totalPages,
    canPrev,
    canNext,
    pages,
  }
}
