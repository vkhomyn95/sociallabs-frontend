<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  SlbButton,
  SlbConfirmModal,
  SlbSelect,
  SlbTable,
  SlbToggle,
  slbToast,
  type SelectOption,
  type SelectValue,
  type TableColumn,
} from '@sociallabs/frontend-components'
import { ExecutionStatus, type ExecutionSummary } from '@/core/execution/types'
import { RouteName } from '@/layouts/navigation'
import { UNFINISHED, useExecutionStore } from '@/stores/execution'
import ExecutionStatusBadge from './components/ExecutionStatusBadge.vue'
import { formatDuration, formatStarted, MODE, STATUS } from './presentation'

/** Execution history of all workflows, newest first; a row opens the execution on its workflow. */
const store = useExecutionStore()
const route = useRoute()
const router = useRouter()

const REFRESH_MS = 5000

const columns: TableColumn<ExecutionSummary>[] = [
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'id', label: 'Execution', width: '110px' },
  { key: 'workflowId', label: 'Workflow', minWidth: '180px' },
  { key: 'mode', label: 'Mode', width: '100px' },
  { key: 'startedAt', label: 'Started', width: '170px' },
  { key: 'durationMs', label: 'Duration', width: '110px', align: 'right' },
  { key: 'errorMessage', label: 'Error', minWidth: '200px' },
  { key: 'actions', label: '', width: '96px', align: 'right' },
]

const statusOptions: SelectOption[] = Object.values(ExecutionStatus).map((status) => ({
  value: status,
  label: STATUS[status].label,
  icon: STATUS[status].icon,
}))
const workflowOptions = computed<SelectOption[]>(() => store.workflows.map((w) => ({ value: w.id, label: w.name })))

// ─── Filters, kept in the URL so links (e.g. from the editor) open a filtered list ──────────

const numberParam = (value: unknown): number | null => (typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null)
const statusParam = (value: unknown): ExecutionStatus | null =>
  Object.values(ExecutionStatus).includes(value as ExecutionStatus) ? (value as ExecutionStatus) : null

function applyRoute(): Promise<void> {
  return store.SET_FILTERS({ workflowId: numberParam(route.query.workflowId), status: statusParam(route.query.status) })
}

function setFilter(name: 'workflowId' | 'status', value: SelectValue | SelectValue[] | null): void {
  const query = { ...route.query, [name]: value === null || Array.isArray(value) ? undefined : String(value) }
  void router.replace({ query })
}

watch(() => [route.query.workflowId, route.query.status], () => void applyRoute())

// ─── Auto refresh ────────────────────────────────────────────────────

const autoRefresh = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

function tick(): void {
  if (autoRefresh.value && document.visibilityState === 'visible') void store.REFRESH()
}

onMounted(() => {
  void store.LOAD_WORKFLOWS(true)
  void applyRoute()
  timer = setInterval(tick, REFRESH_MS)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// ─── Rows ────────────────────────────────────────────────────────────

function open(execution: ExecutionSummary): void {
  void router.push({ name: RouteName.EXECUTION_VIEW, params: { id: execution.workflowId, executionId: execution.id } })
}

async function retry(execution: ExecutionSummary): Promise<void> {
  try {
    const executionId = await store.RETRY(execution.id)
    slbToast.success(`Execution ${executionId} started as a retry of ${execution.id}`)
  } catch (error) {
    slbToast.error(`Retry failed: ${messageOf(error)}`)
  }
}

const pendingDelete = ref<ExecutionSummary | null>(null)
const deleting = ref(false)

async function confirmDelete(): Promise<void> {
  const execution = pendingDelete.value
  if (!execution) return
  deleting.value = true
  try {
    await store.REMOVE(execution.id)
    pendingDelete.value = null
  } catch (error) {
    slbToast.error(`Delete failed: ${messageOf(error)}`)
  } finally {
    deleting.value = false
  }
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))
</script>

<template>
  <div class="wf-executions">
    <div class="wf-executions__toolbar">
      <SlbSelect
        class="wf-executions__filter"
        size="sm"
        placeholder="All workflows"
        searchable
        clearable
        :options="workflowOptions"
        :model-value="store.filters.workflowId"
        @update:model-value="setFilter('workflowId', $event)"
      />
      <SlbSelect
        class="wf-executions__filter wf-executions__filter--status"
        size="sm"
        placeholder="Any status"
        clearable
        :options="statusOptions"
        :model-value="store.filters.status"
        @update:model-value="setFilter('status', $event)"
      />
      <span class="wf-executions__spacer" />
      <SlbToggle v-model="autoRefresh" label="Auto refresh" />
      <SlbButton size="sm" variant="secondary" icon-left="action_refresh" :loading="store.loading" @click="store.LOAD()">
        Refresh
      </SlbButton>
    </div>

    <p v-if="store.error" class="wf-executions__error">Could not load executions: {{ store.error }}</p>

    <SlbTable
      class="wf-executions__table"
      :columns="columns"
      :data="store.items"
      row-key="id"
      size="sm"
      scroll-mode="infinite"
      :has-more="store.hasMore"
      :loading="store.loading || store.loadingMore"
      fill
      sticky-header
      hoverable
      empty-icon="dev_nodes"
      :empty-text="store.filters.workflowId || store.filters.status ? 'No executions match the filters' : 'No executions yet'"
      @load-more="store.LOAD_MORE()"
      @row-click="open"
    >
      <template #cell-status="{ row }">
        <ExecutionStatusBadge :status="row.status" />
      </template>
      <template #cell-id="{ row }">
        <span class="wf-executions__id">#{{ row.id }}</span>
        <span v-if="row.retryOfId" class="wf-executions__muted" :title="`Retry of #${row.retryOfId}`"> ↻</span>
      </template>
      <template #cell-workflowId="{ row }">
        <span class="wf-executions__workflow">{{ store.workflowName(row.workflowId) }}</span>
        <span class="wf-executions__muted">{{ row.workflowVersionId ? '' : ' · draft' }}</span>
      </template>
      <template #cell-mode="{ row }">{{ MODE[row.mode] }}</template>
      <template #cell-startedAt="{ row }">
        <span :title="new Date(row.startedAt).toLocaleString()">{{ formatStarted(row.startedAt) }}</span>
      </template>
      <template #cell-durationMs="{ row }">{{ formatDuration(row.durationMs) }}</template>
      <template #cell-errorMessage="{ row }">
        <span v-if="row.errorMessage" class="wf-executions__message" :title="row.errorMessage">
          <template v-if="row.errorNodeId">{{ row.errorNodeId }}: </template>{{ row.errorMessage }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="wf-executions__actions" @click.stop>
          <SlbButton
            variant="ghost"
            size="sm"
            icon-only
            icon-left="action_refresh"
            :disabled="UNFINISHED.has(row.status)"
            :aria-label="`Retry execution ${row.id}`"
            title="Retry with the same trigger data"
            @click="retry(row)"
          />
          <SlbButton
            variant="ghost"
            size="sm"
            icon-only
            icon-left="action_trash"
            :disabled="UNFINISHED.has(row.status)"
            :aria-label="`Delete execution ${row.id}`"
            @click="pendingDelete = row"
          />
        </div>
      </template>
    </SlbTable>

    <SlbConfirmModal
      :model-value="pendingDelete !== null"
      title="Delete execution"
      :message="`Delete execution #${pendingDelete?.id}? Its node runs and data go too. This cannot be undone.`"
      confirm-label="Delete"
      danger
      :loading="deleting"
      @update:model-value="!$event && (pendingDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-executions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: 20px;
}

.wf-executions__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.wf-executions__filter {
  width: 260px;

  &--status {
    width: 180px;
  }
}

.wf-executions__spacer {
  flex: 1;
}

.wf-executions__error {
  margin: 0;
  font-size: var(--slb-font-sm);
  color: var(--slb-color-error);
}

.wf-executions__table {
  flex: 1;
  min-height: 0;

  :deep(tbody tr) {
    cursor: pointer;
  }
}

.wf-executions__id {
  font-variant-numeric: tabular-nums;
}

.wf-executions__workflow {
  font-weight: var(--slb-fw-medium);
}

.wf-executions__muted {
  color: var(--slb-color-text-muted);
}

.wf-executions__message {
  display: block;
  max-width: 360px;
  overflow: hidden;
  color: var(--slb-color-error);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-executions__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
