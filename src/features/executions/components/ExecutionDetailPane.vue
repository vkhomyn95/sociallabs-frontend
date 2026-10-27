<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { SlbAlert, SlbBadge, SlbButton, slbToast } from '@sociallabs/frontend-components'
import { ExecutionGraphSource } from '@/core/execution/types'
import type { NodeId } from '@/core/workflow/model'
import EditorCanvas from '@/features/workflow-editor/canvas/EditorCanvas.vue'
import NodeDetailsView from '@/features/workflow-editor/ndv/NodeDetailsView.vue'
import { editorApi } from '@/features/workflow-editor/api/editorApi'
import { useExecutionStore } from '@/stores/execution'
import { formatDuration, MODE } from '../presentation'
import { useExecutionView } from '../useExecutionView'
import ExecutionStatusBadge from './ExecutionStatusBadge.vue'

/** One execution on the graph it ran on, read-only; double click a node to see its input and output. */
const props = defineProps<{ executionId: number }>()

const emit = defineEmits<{
  /** A retry started; the page shows the new execution. */
  retried: [executionId: number]
  openEditor: []
}>()

const store = useExecutionStore()
const execution = useExecutionView(props.executionId, () => void store.REFRESH())
const openNodeId = shallowRef<NodeId | null>(null)
const retrying = shallowRef(false)

const summary = computed(() => execution.detail.value?.execution ?? null)
const version = computed(() => {
  const graph = execution.graph.value
  if (!graph) return ''
  return graph.source === ExecutionGraphSource.VERSION ? `Version ${graph.versionNo ?? graph.versionId}` : 'Draft run'
})
const errorNode = computed(() => {
  const id = summary.value?.errorNodeId
  return id ? execution.view.value?.document.node(id) : undefined
})

async function retry(): Promise<void> {
  retrying.value = true
  try {
    emit('retried', await store.RETRY(props.executionId))
  } catch (error) {
    slbToast.error(`Retry failed: ${editorApi.errorMessage(error)}`)
  } finally {
    retrying.value = false
  }
}
</script>

<template>
  <section class="wf-exec-pane">
    <SlbAlert v-if="execution.loadError.value" variant="error" class="wf-exec-pane__alert">
      Could not open execution #{{ executionId }}: {{ execution.loadError.value }}
    </SlbAlert>

    <template v-else-if="summary && execution.view.value && execution.catalog.value">
      <header class="wf-exec-pane__header">
        <ExecutionStatusBadge :status="summary.status" />
        <h2 class="wf-exec-pane__title">Execution #{{ summary.id }}</h2>
        <span class="wf-exec-pane__meta">
          {{ new Date(summary.startedAt).toLocaleString() }} · {{ MODE[summary.mode] }}
          <template v-if="summary.durationMs !== null"> · {{ formatDuration(summary.durationMs) }}</template>
          <template v-if="summary.retryOfId"> · retry of #{{ summary.retryOfId }}</template>
        </span>
        <SlbBadge size="sm" color="gray">{{ version }}</SlbBadge>
        <span class="wf-exec-pane__spacer" />
        <SlbButton size="sm" variant="secondary" icon-left="action_refresh" :loading="retrying" :disabled="execution.running.value" @click="retry">
          Retry
        </SlbButton>
        <SlbButton size="sm" variant="secondary" icon-left="action_edit" @click="emit('openEditor')">Open in editor</SlbButton>
      </header>

      <div class="wf-exec-pane__alerts">
        <SlbAlert v-if="summary.errorMessage" variant="error">
          <strong v-if="errorNode">{{ errorNode.name }}: </strong>{{ summary.errorMessage }}
          <SlbButton v-if="errorNode" size="sm" variant="ghost" @click="openNodeId = errorNode.id">Show node</SlbButton>
        </SlbAlert>
        <SlbAlert v-if="execution.graph.value?.source === ExecutionGraphSource.CURRENT_DRAFT" variant="info">
          This run used the draft, which keeps no history: the workflow is shown as it is now and may differ from what ran.
        </SlbAlert>
        <SlbAlert v-if="execution.missingNodes.value.length" variant="warning">
          {{ execution.missingNodes.value.length }} node(s) of this run are no longer in the workflow: {{ execution.missingNodes.value.join(', ') }}
        </SlbAlert>
      </div>

      <div class="wf-exec-pane__canvas">
        <EditorCanvas
          :view="execution.view.value"
          :catalog="execution.catalog.value"
          :tracker="execution.tracker"
          @open="openNodeId = $event"
        />
      </div>

      <NodeDetailsView
        v-if="openNodeId"
        :key="openNodeId"
        :view="execution.view.value"
        :catalog="execution.catalog.value"
        :node-id="openNodeId"
        :run-data="execution.runData.value"
        :tracker="execution.tracker"
        :executing="false"
        @close="openNodeId = null"
      />
    </template>

    <div v-else class="wf-exec-pane__loading">Loading execution…</div>
  </section>
</template>

<style scoped lang="scss">
.wf-exec-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.wf-exec-pane__header {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  background: var(--slb-color-surface, #fff);
  border-bottom: 1px solid var(--slb-color-border);
}

.wf-exec-pane__title {
  margin: 0;
  font-size: var(--slb-font-md, 15px);
  font-weight: var(--slb-fw-semibold);
}

.wf-exec-pane__meta {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-exec-pane__spacer {
  flex: 1;
}

.wf-exec-pane__alerts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;

  &:not(:empty) {
    padding-top: 10px;
  }
}

.wf-exec-pane__alert {
  margin: 24px;
}

.wf-exec-pane__canvas {
  flex: 1;
  min-height: 0;
}

.wf-exec-pane__loading {
  display: grid;
  flex: 1;
  place-items: center;
  color: var(--slb-color-text-muted);
}
</style>
