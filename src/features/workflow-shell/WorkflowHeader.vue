<script setup lang="ts">
import { useRouter } from 'vue-router'
import { SlbBadge, SlbHeader, SlbTab } from '@sociallabs/frontend-components'
import { isWorkflowTab, routeOfTab, WORKFLOW_TABS, type WorkflowTab } from './workflowTabs'
import WorkflowBreadcrumb from './WorkflowBreadcrumb.vue'

/**
 * Header of every workflow page: the breadcrumb with the name, the state, the Editor | Executions tabs and the
 * page's own actions in the `actions` slot. Switching tabs navigates; the pages only say which tab they are.
 */
const props = defineProps<{
  workflowId: number
  name: string
  /** Shown as a badge; null while unknown. */
  active: boolean | null
  tab: WorkflowTab
  /** The editor renames in place; other pages show the name. */
  renamable?: boolean
}>()

const emit = defineEmits<{ rename: [name: string] }>()

const router = useRouter()
const tabs = [...WORKFLOW_TABS]

function onTab(key: string): void {
  if (isWorkflowTab(key) && key !== props.tab) void router.push(routeOfTab(key, props.workflowId))
}
</script>

<template>
  <SlbHeader bordered class="wf-header">
    <template #brand>
      <WorkflowBreadcrumb :name="name" :renamable="renamable" @rename="emit('rename', $event)" />
      <SlbBadge v-if="active !== null" :color="active ? 'success' : 'gray'" dot>{{ active ? 'Active' : 'Inactive' }}</SlbBadge>
    </template>

    <template #center>
      <!-- Hangs on the bottom border, centred, over the page below, like n8n. -->
      <div class="wf-header__tabs">
        <SlbTab :model-value="tab" :tabs="tabs" variant="segmented" @update:model-value="onTab" />
      </div>
    </template>

    <template #actions>
      <slot name="actions" />
    </template>
  </SlbHeader>
</template>

<style scoped lang="scss">
.wf-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.wf-header__tabs {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);

  // Only the switch is wanted: no panel below it, and a compact list.
  :deep(.slb-tab__panel) {
    display: none;
  }

  :deep(.slb-tab__list) {
    width: auto;
    min-height: 0;
    padding: 2px;
    box-shadow: var(--slb-shadow-sm);
  }

  :deep(.slb-tab__btn) {
    height: 26px;
    padding: 0 14px;
    font-size: var(--slb-font-sm);
  }
}

</style>
