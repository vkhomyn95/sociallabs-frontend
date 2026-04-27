<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflow'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'

import WorkflowViewToolbar from '@/components/workflow/WorkflowViewToolbar.vue'
import WorkflowCanvas from '@/components/WorkflowCanvas.vue'

import WorkflowSettingsModal from '@/components/workflow/WorkflowSettingsModal.vue'

import { generateNodeId } from '@/stores/node/utils'
import type { NodeInstance } from '@/stores/node/types.ts'
import { storeToRefs } from 'pinia'
import NodePanel from '@/components/nodes/panel/NodePanel.vue'

const route = useRoute()
const router = useRouter()
const workflowStore = useWorkflowStore()
const {loading, workflow} = storeToRefs(workflowStore);
const {FETCH_WORKFLOW_BY_ID, SETUP_WORKFLOW, CREATE_WORKFLOW, UPDATE_WORKFLOW, EXECUTE_WORKFLOW, ADD_NODE} = workflowStore;
const modal = useModal()

const toast = useToast()
const canvasRef = ref<InstanceType<typeof WorkflowCanvas>>()

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const workflowId = route.params.id as string;

  if (workflowId) {
    await FETCH_WORKFLOW_BY_ID(parseInt(workflowId));
  } else {
    await SETUP_WORKFLOW();
  }
})

// ─── Toolbar handlers ─────────────────────────────────────────────────────────
const onBack = (): void => {
  router.push('/workflows')
}

const onSave = async (): Promise<void> => {
  if (!workflow.value) return
  loading.value = true;

  try {
    const success = workflow.value.id ?
      await UPDATE_WORKFLOW(workflow.value.id!, workflow.value):
      await CREATE_WORKFLOW(workflow.value);

    if (success) {
      toast.success('Workflow saved successfully')
      if (workflow.value.id) {
        await router.replace(`/workflows/${workflowStore.workflow.id}`);
      }
    } else {
      toast.error('Failed to save workflow')
    }
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Failed to save workflow')
  } finally {
    loading.value = false;
  }
}

const onToggle = async (): Promise<void> => {
  if (!workflow.value?.id) {
    toast.warning('Please save the workflow first')
    return
  }

  const success = await workflowStore.TOGGLE_WORKFLOW(workflow.value.id)

  if (success) {
    toast.success(workflow.value.active ? 'Workflow activated' : 'Workflow deactivated')
  } else {
    toast.error('Failed to toggle workflow')
  }
}

// ─── Execute ──────────────────────────────────────────────────────────────────
const onExecute = async (): Promise<void> => {
  if (!workflow.value?.id) {
    toast.warning('Please save the workflow first')
    return
  }

  try {
    const success = await EXECUTE_WORKFLOW(workflow.value.id)
  } catch (err: unknown) {
  }
}

// ─── Settings modal ───────────────────────────────────────────────────────────
const openSettings = async (): Promise<void> => {
  if (!workflow.value) return

  try {
    await modal.open<{ name: string; description: string; active: boolean }>(
      WorkflowSettingsModal,
      {},
      { size: 'md' }
    )

    toast.info('Settings updated. Click Save to persist.')
  } catch {
    // User cancelled
  }
}

// ─── Credentials modal ────────────────────────────────────────────────────────
const openCredentials = async (): Promise<void> => {
  const { default: CredentialsManager } = await import('@/components/auth/CredentialsManager.vue')
  await modal.open(CredentialsManager, {}, { size: 'lg', closeOnBackdrop: false })
}

// ─── Drop handler ─────────────────────────────────────────────────────────────
const onDrop = (event: DragEvent): void => {
  event.preventDefault()
  const nodeData = event.dataTransfer?.getData('application/node')
  if (!nodeData) return

  const node = JSON.parse(nodeData)
  const rect = (event.target as HTMLElement).getBoundingClientRect()

  const newNode: NodeInstance = {
    ...node,
    nodeId: generateNodeId(),
    position: { x: event.clientX - rect.left, y: event.clientY - rect.top },
    parameters: {},
    disabled: false,
  }

  ADD_NODE(newNode)
  toast.success(`Added ${node.name} node`)
}
</script>

<template>
  <div class="slb-wf-view">
    <WorkflowViewToolbar
      v-if="workflow"
      @back="onBack"
      @save="onSave"
      @toggle="onToggle"
      @execute="onExecute"
      @settings="openSettings"
      @credentials="openCredentials"
    />

    <div class="slb-wf-view__content">
      <NodePanel/>
      <div class="slb-wf-view__canvas" @drop="onDrop" @dragover.prevent>
        <WorkflowCanvas ref="canvasRef" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use './workflow-view.scss';
</style>
