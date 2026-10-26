<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflow'
import { useModal } from '@/composables/useModal'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import ConfirmModal from '@/components/ui/modal/ConfirmModal.vue'
import { storeToRefs } from 'pinia'
import { RouteName } from '@/layouts/navigation'
import { editorApi } from '@/features/workflow-editor/api/editorApi'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const workflowStore = useWorkflowStore();
const {loading, workflows} = storeToRefs(workflowStore);
const {FETCH_WORKFLOWS, EXECUTE_WORKFLOW, DELETE_WORKFLOW} = workflowStore;
const modal = useModal()
const toast = useToast()

/** Route flag of migration step 10: which editor opens a workflow by default. */
const NEW_EDITOR_DEFAULT = import.meta.env.VITE_WORKFLOW_EDITOR === 'v2'

onMounted(() => {
  FETCH_WORKFLOWS()
})

const createWorkflow = async (): Promise<void> => {
  if (!NEW_EDITOR_DEFAULT) {
    router.push('/workflow')
    return
  }
  try {
    const created = await editorApi.create('New workflow')
    openInNewEditor(created.id)
  } catch (error) {
    toast.error(editorApi.errorMessage(error))
  }
}

const openInNewEditor = (workflowId: number): void => {
  router.push({ name: RouteName.WORKFLOW_EDITOR, params: { id: workflowId } })
}

const editWorkflow = (workflowId: number): void => {
  if (NEW_EDITOR_DEFAULT) openInNewEditor(workflowId)
  else router.push(`/workflows/${workflowId}`)
}

const executeWorkflow = (workflowId: number): void => {
  EXECUTE_WORKFLOW(workflowId)
}

const deleteWorkflow = async (workflowId: number): Promise<void> => {
  try {
    await modal.open(ConfirmModal, {
      title: 'Delete workflow',
      message: 'Are you sure you want to delete this workflow? This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    }, { size: 'sm', closeOnBackdrop: false })

    await DELETE_WORKFLOW(workflowId)
  } catch {
    // User cancelled — do nothing
  }
}

const formatDate = (date?: string): string => {
  if (!date) return 'Never'
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86_400_000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return d.toLocaleDateString()
}
</script>

<template>
  <div class="slb-wf-list">
    <div class="slb-wf-list__actions">
      <SlbButton icon-left="fas fa-plus" @click="createWorkflow">Create workflow</SlbButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="slb-wf-list__loading">
      <div class="slb-wf-list__spinner" aria-hidden="true"></div>
      <span>Loading workflows...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="workflows.length === 0" class="slb-wf-list__empty">
      <div class="slb-wf-list__empty-icon" aria-hidden="true">
        <i class="fas fa-hexagon-nodes"></i>
      </div>
      <h2 class="slb-wf-list__empty-title">No workflows yet</h2>
      <p class="slb-wf-list__empty-sub">Create your first workflow to get started</p>
    </div>

    <!-- Grid -->
    <div v-else class="slb-wf-list__grid">
      <article
        v-for="workflow in workflows"
        :key="workflow.id"
        class="slb-wf-list__card"
        tabindex="0"
        :aria-label="`Open workflow ${workflow.name}`"
        @click="editWorkflow(workflow.id!)"
        @keydown.enter="editWorkflow(workflow.id!)"
      >
        <div class="slb-wf-list__card-header">
          <h3 class="slb-wf-list__card-name">{{ workflow.name }}</h3>
          <span
            class="slb-wf-list__card-badge"
            :class="workflow.active ? 'slb-wf-list__card-badge--active' : 'slb-wf-list__card-badge--inactive'"
          >
            {{ workflow.active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <p  class="slb-wf-list__card-desc">
          {{ workflow.description }}
        </p>

        <div class="slb-wf-list__card-stats">
          <span class="slb-wf-list__card-stat">
            <i class="fas fa-circle-nodes"></i>
            {{ workflow.nodes.length }} nodes
          </span>
          <span class="slb-wf-list__card-stat">
            <i class="fas fa-link"></i>
            {{ workflow.connections.length }} connections
          </span>
        </div>

        <div class="slb-wf-list__card-footer">
          <span class="slb-wf-list__card-date">
            Updated {{ formatDate(workflow.updatedAt) }}
          </span>

          <div class="slb-wf-list__card-actions" @click.stop>
            <SlbButton
              variant="ghost"
              size="sm"
              icon-only
              icon-left="fas fa-play"
              :aria-label="`Execute ${workflow.name}`"
              @click="executeWorkflow(workflow.id!)"
            />
            <SlbButton
              variant="ghost"
              size="sm"
              icon-only
              :icon-left="NEW_EDITOR_DEFAULT ? 'fas fa-pen' : 'fas fa-diagram-project'"
              :aria-label="NEW_EDITOR_DEFAULT ? `Open ${workflow.name} in the legacy editor` : `Open ${workflow.name} in the new editor`"
              :title="NEW_EDITOR_DEFAULT ? 'Legacy editor' : 'New editor'"
              @click="NEW_EDITOR_DEFAULT ? router.push(`/workflows/${workflow.id}`) : openInNewEditor(workflow.id!)"
            />
            <SlbButton
              variant="ghost"
              size="sm"
              icon-only
              icon-left="fas fa-trash"
              :aria-label="`Delete ${workflow.name}`"
              @click="deleteWorkflow(workflow.id!)"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style lang="scss">
@use './workflow-list.scss';
</style>
