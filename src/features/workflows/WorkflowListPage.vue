<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SlbAlert, SlbButton, SlbConfirmModal, SlbIcon, SlbInput, SlbTab, slbToast, type TabItem } from '@sociallabs/frontend-components'
import type { WorkflowDto } from '@/core/workflow/dto'
import { routeOfTab, WorkflowTab } from '@/features/workflow-shell/workflowTabs'
import { ExecutionService } from '@/stores/execution'
import { messageOf, useWorkflowStore, WorkflowFilter } from '@/stores/workflow'
import WorkflowCard from './components/WorkflowCard.vue'
import { WorkflowCardAction } from './presentation'

/** Workflows as cards, filtered by state and searched by name, like the Agents page. */
const store = useWorkflowStore()
const router = useRouter()

const FILTER_LABELS: Readonly<Record<WorkflowFilter, string>> = {
  [WorkflowFilter.ALL]: 'All',
  [WorkflowFilter.ACTIVE]: 'Active',
  [WorkflowFilter.INACTIVE]: 'Inactive',
}

const tabs = computed<TabItem[]>(() =>
  Object.values(WorkflowFilter).map((filter) => ({ key: filter, label: FILTER_LABELS[filter], badge: store.countOf(filter) })),
)

const filter = computed<string>({
  get: () => store.filter,
  set: (key) => (store.filter = Object.values(WorkflowFilter).find((f) => f === key) ?? WorkflowFilter.ALL),
})

onMounted(() => void store.LOAD())

const open = (workflow: WorkflowDto, tab = WorkflowTab.EDITOR) => void router.push(routeOfTab(tab, workflow.id))

async function create(): Promise<void> {
  try {
    open(await store.CREATE('New workflow'))
  } catch (error) {
    slbToast.error(`Could not create a workflow: ${messageOf(error)}`)
  }
}

async function execute(workflow: WorkflowDto): Promise<void> {
  try {
    const started = await ExecutionService.start(workflow.id)
    if (started.executionId) slbToast.success(`Execution ${started.executionId} of «${workflow.name}» started`)
    else slbToast.error(`Execution was not started: ${started.error ?? 'rejected'}`)
  } catch (error) {
    slbToast.error(messageOf(error))
  }
}

async function toggleActive(workflow: WorkflowDto): Promise<void> {
  try {
    const updated = await store.SET_ACTIVE(workflow.id, !workflow.active)
    slbToast.success(`«${updated.name}» ${updated.active ? 'activated' : 'deactivated'}`)
  } catch (error) {
    slbToast.error(messageOf(error))
  }
}

// ─── Delete ──────────────────────────────────────────────────────────

const deleting = ref<WorkflowDto | null>(null)
const removing = ref(false)

const confirmOpen = computed<boolean>({
  get: () => deleting.value !== null,
  set: (value) => {
    if (!value) deleting.value = null
  },
})

async function confirmDelete(): Promise<void> {
  const workflow = deleting.value
  if (!workflow) return
  removing.value = true
  try {
    await store.REMOVE(workflow.id)
    slbToast.success(`Workflow «${workflow.name}» deleted`)
    deleting.value = null
  } catch (error) {
    slbToast.error(`Delete failed: ${messageOf(error)}`)
  } finally {
    removing.value = false
  }
}

const ACTIONS: Readonly<Record<WorkflowCardAction, (workflow: WorkflowDto) => void>> = {
  [WorkflowCardAction.OPEN]: (workflow) => open(workflow),
  [WorkflowCardAction.EXECUTE]: (workflow) => void execute(workflow),
  [WorkflowCardAction.EXECUTIONS]: (workflow) => open(workflow, WorkflowTab.EXECUTIONS),
  [WorkflowCardAction.TOGGLE_ACTIVE]: (workflow) => void toggleActive(workflow),
  [WorkflowCardAction.DELETE]: (workflow) => (deleting.value = workflow),
}
</script>

<template>
  <div class="wf-list">
    <header class="wf-list__head">
      <div>
        <h1 class="wf-list__title">Workflows</h1>
        <p class="wf-list__sub">Automations that react to messages and events in your connected accounts.</p>
      </div>
      <SlbButton icon-left="action_plus" @click="create">New workflow</SlbButton>
    </header>

    <div class="wf-list__toolbar">
      <SlbTab v-model="filter" :tabs="tabs" variant="segmented" />
      <SlbInput v-model="store.search" class="wf-list__search" size="sm" icon-left="action_search" placeholder="Search workflows" clearable />
    </div>

    <SlbAlert v-if="store.error" variant="error" class="wf-list__error">Could not load workflows: {{ store.error }}</SlbAlert>

    <div v-if="store.loading && !store.items.length" class="wf-list__empty">
      <span class="wf-list__empty-icon"><SlbIcon name="shape_spinner" :size="24" /></span>
      <p>Loading workflows…</p>
    </div>

    <div v-else-if="store.filtered.length" class="wf-list__grid">
      <WorkflowCard
        v-for="workflow in store.filtered"
        :key="workflow.id"
        :workflow="workflow"
        :node-types="store.nodeTypes ?? []"
        :switching="store.isSwitching(workflow.id)"
        @action="ACTIONS[$event](workflow)"
      />
    </div>

    <div v-else-if="!store.error" class="wf-list__empty">
      <span class="wf-list__empty-icon"><SlbIcon name="dev_nodes" :size="28" /></span>
      <template v-if="store.items.length">
        <h2>No workflows match</h2>
        <p>Try another filter or search query.</p>
      </template>
      <template v-else>
        <h2>No workflows yet</h2>
        <p>Create a workflow, add a trigger and the steps that should follow.</p>
        <SlbButton icon-left="action_plus" @click="create">New workflow</SlbButton>
      </template>
    </div>

    <SlbConfirmModal
      v-model="confirmOpen"
      title="Delete workflow"
      :message="`Delete «${deleting?.name}»? Its versions and execution history go too. This cannot be undone.`"
      confirm-label="Delete"
      danger
      :loading="removing"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.wf-list__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.wf-list__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--slb-color-gray-900);
}

.wf-list__sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--slb-color-gray-500);
}

.wf-list__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  // The tabs only filter: their empty panel would push the row out of line.
  :deep(.slb-tab__panel) {
    display: none;
  }
}

.wf-list__search {
  width: 260px;
}

.wf-list__error {
  margin-bottom: 16px;
}

.wf-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.wf-list__empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 72px 16px;
  text-align: center;

  h2 {
    margin: 8px 0 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--slb-color-gray-900);
  }

  p {
    max-width: 42ch;
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--slb-color-gray-500);
  }
}

.wf-list__empty-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  color: var(--slb-color-gray-400);
  background: var(--slb-color-gray-100);
  border-radius: 50%;
}
</style>
