<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SlbIcon, SlbSelect, type SelectOption, type SelectValue } from '@sociallabs/frontend-components'
import { ExecutionStatus } from '@/core/execution/types'
import { useExecutionStore } from '@/stores/execution'
import { formatDuration, formatStarted, MODE, STATUS } from '../presentation'

/** Executions of one workflow, newest first, to switch between them like n8n's executions tab. */
const props = defineProps<{
  workflowId: number
  selectedId: number | null
}>()

const emit = defineEmits<{ select: [executionId: number] }>()

const store = useExecutionStore()

const REFRESH_MS = 5000

const statusOptions: SelectOption[] = Object.values(ExecutionStatus).map((status) => ({
  value: status,
  label: STATUS[status].label,
  icon: STATUS[status].icon,
}))

const setStatus = (value: SelectValue | SelectValue[] | null): Promise<void> =>
  store.SET_FILTERS({ status: typeof value === 'string' ? (value as ExecutionStatus) : null })

// ─── Paging: the next page loads when the end of the list scrolls into view ─────────

const end = ref<HTMLElement>()
let observer: IntersectionObserver | null = null
let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.workflowId,
  (workflowId) => void store.SET_FILTERS({ workflowId, status: null }),
  { immediate: true },
)

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void store.LOAD_MORE()
  })
  if (end.value) observer.observe(end.value)
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') void store.REFRESH()
  }, REFRESH_MS)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (timer) clearInterval(timer)
})
</script>

<template>
  <aside class="wf-exec-sidebar">
    <header class="wf-exec-sidebar__header">
      <h2 class="wf-exec-sidebar__title">Executions</h2>
      <SlbSelect
        size="sm"
        placeholder="Any status"
        clearable
        :options="statusOptions"
        :model-value="store.filters.status"
        @update:model-value="setStatus"
      />
    </header>

    <ol class="wf-exec-sidebar__list">
      <li v-for="execution in store.items" :key="execution.id">
        <button
          type="button"
          class="wf-exec-sidebar__item"
          :class="[`wf-exec-sidebar__item--${STATUS[execution.status].color}`, { 'wf-exec-sidebar__item--selected': execution.id === selectedId }]"
          :aria-current="execution.id === selectedId ? 'true' : undefined"
          @click="emit('select', execution.id)"
        >
          <span class="wf-exec-sidebar__line">
            <span class="wf-exec-sidebar__time">{{ formatStarted(execution.startedAt) }}</span>
            <span class="wf-exec-sidebar__status">
              <SlbIcon :name="STATUS[execution.status].icon" :size="12" />
              {{ STATUS[execution.status].label }}
            </span>
          </span>
          <span class="wf-exec-sidebar__meta">
            #{{ execution.id }} · {{ MODE[execution.mode] }} · {{ formatDuration(execution.durationMs) }}
          </span>
        </button>
      </li>
      <li ref="end" class="wf-exec-sidebar__end">
        <template v-if="store.loading || store.loadingMore">Loading…</template>
        <template v-else-if="!store.items.length">No executions yet</template>
      </li>
    </ol>
  </aside>
</template>

<style scoped lang="scss">
.wf-exec-sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  min-height: 0;
  background: var(--slb-color-surface, #fff);
  border-right: 1px solid var(--slb-color-border);
}

.wf-exec-sidebar__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--slb-color-border);
}

.wf-exec-sidebar__title {
  margin: 0;
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-semibold);
}

.wf-exec-sidebar__list {
  flex: 1;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  list-style: none;
}

.wf-exec-sidebar__item {
  --wf-exec-color: var(--slb-color-gray-400);

  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  background: none;
  border: 0;
  border-left: 3px solid var(--wf-exec-color);
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &:hover {
    background: var(--slb-color-gray-50);
  }

  &--selected,
  &--selected:hover {
    background: var(--slb-color-primary-light, var(--slb-color-gray-100));
  }

  &--success {
    --wf-exec-color: var(--slb-color-success);
  }

  &--error {
    --wf-exec-color: var(--slb-color-error);
  }

  &--primary {
    --wf-exec-color: var(--slb-color-primary);
  }

  &--warning {
    --wf-exec-color: var(--slb-color-warning);
  }
}

.wf-exec-sidebar__line {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.wf-exec-sidebar__time {
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text);
}

.wf-exec-sidebar__status {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: var(--slb-font-xs);
  color: var(--wf-exec-color);
}

.wf-exec-sidebar__meta {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-exec-sidebar__end {
  padding: 12px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  text-align: center;
}
</style>
