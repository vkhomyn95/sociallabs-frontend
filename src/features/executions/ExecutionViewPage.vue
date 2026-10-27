<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlbButton } from '@sociallabs/frontend-components'
import { RouteName } from '@/layouts/navigation'
import WorkflowHeader from '@/features/workflow-shell/WorkflowHeader.vue'
import { routeOfTab, WorkflowTab } from '@/features/workflow-shell/workflowTabs'
import { useExecutionStore } from '@/stores/execution'
import ExecutionDetailPane from './components/ExecutionDetailPane.vue'
import WorkflowExecutionsSidebar from './components/WorkflowExecutionsSidebar.vue'

/**
 * The executions tab of a workflow: its executions on the left, the selected one on its workflow on the right.
 * Without an execution in the URL the newest one is opened.
 */
const route = useRoute()
const router = useRouter()
const store = useExecutionStore()

const workflowId = computed(() => Number(route.params.id))
const executionId = computed(() => (route.params.executionId ? Number(route.params.executionId) : null))

function select(id: number, replace = false): void {
  const target = { name: RouteName.EXECUTION_VIEW, params: { id: workflowId.value, executionId: id } }
  void (replace ? router.replace(target) : router.push(target))
}

function openEditor(): void {
  void router.push(routeOfTab(WorkflowTab.EDITOR, workflowId.value))
}

// Open the newest execution once the list of this workflow has loaded.
watch(
  () => [executionId.value, store.loading, store.filters.workflowId, store.items[0]?.id] as const,
  ([selected, loading, filtered, newest]) => {
    if (selected === null && !loading && filtered === workflowId.value && newest !== undefined) select(newest, true)
  },
  { immediate: true },
)

// Forced: the editor may have renamed or activated the workflow since the names were loaded.
onMounted(() => void store.LOAD_WORKFLOWS(true))
</script>

<template>
  <div class="wf-exec-page">
    <WorkflowHeader
      :workflow-id="workflowId"
      :name="store.workflowName(workflowId)"
      :active="store.workflowActive(workflowId)"
      :tab="WorkflowTab.EXECUTIONS"
    />

    <div class="wf-exec-page__body">
      <WorkflowExecutionsSidebar :workflow-id="workflowId" :selected-id="executionId" @select="select" />
      <ExecutionDetailPane
        v-if="executionId !== null"
        :key="executionId"
        :execution-id="executionId"
        @retried="select"
        @open-editor="openEditor"
      />
      <div v-else class="wf-exec-page__empty">
        <template v-if="store.loading">Loading executions…</template>
        <template v-else>
          <p>This workflow has not run yet.</p>
          <SlbButton size="sm" @click="openEditor">Open the editor</SlbButton>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wf-exec-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--slb-color-gray-50);
}

.wf-exec-page__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.wf-exec-page__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  color: var(--slb-color-text-muted);
}
</style>
