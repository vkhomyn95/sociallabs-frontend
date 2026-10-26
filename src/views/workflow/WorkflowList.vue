<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { SlbButton, SlbConfirmModal, slbToast } from '@sociallabs/frontend-components'
import { RouteName } from '@/layouts/navigation'
import type { WorkflowDto } from '@/core/workflow/dto'
import { editorApi } from '@/features/workflow-editor/api/editorApi'
import { executionApi } from '@/features/workflow-editor/api/executionApi'

const router = useRouter()
const workflows = shallowRef<WorkflowDto[]>([])
const loading = ref(true)
const pendingDelete = ref<WorkflowDto | null>(null)
const deleting = ref(false)

async function load(): Promise<void> {
  loading.value = true
  try {
    workflows.value = await editorApi.list()
  } catch (error) {
    slbToast.error(`Could not load workflows: ${editorApi.errorMessage(error)}`)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const openWorkflow = (workflowId: number): void => {
  router.push({ name: RouteName.WORKFLOW_EDITOR, params: { id: workflowId } })
}

async function createWorkflow(): Promise<void> {
  try {
    openWorkflow((await editorApi.create('New workflow')).id)
  } catch (error) {
    slbToast.error(editorApi.errorMessage(error))
  }
}

async function executeWorkflow(workflow: WorkflowDto): Promise<void> {
  try {
    const started = await executionApi.start(workflow.id)
    if (started.executionId) slbToast.success(`Execution ${started.executionId} of ${workflow.name} started`)
    else slbToast.error(`Execution was not started: ${started.error ?? 'rejected'}`)
  } catch (error) {
    slbToast.error(editorApi.errorMessage(error))
  }
}

async function confirmDelete(): Promise<void> {
  const workflow = pendingDelete.value
  if (!workflow) return
  deleting.value = true
  try {
    await editorApi.remove(workflow.id)
    workflows.value = workflows.value.filter((w) => w.id !== workflow.id)
    pendingDelete.value = null
  } catch (error) {
    slbToast.error(`Delete failed: ${editorApi.errorMessage(error)}`)
  } finally {
    deleting.value = false
  }
}

const formatDate = (date?: string | null): string => {
  if (!date) return 'Never'
  const d = new Date(date)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)

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
      <SlbButton icon-left="action_plus" @click="createWorkflow">Create workflow</SlbButton>
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
        @click="openWorkflow(workflow.id)"
        @keydown.enter="openWorkflow(workflow.id)"
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
              icon-left="media_play"
              :aria-label="`Execute ${workflow.name}`"
              @click="executeWorkflow(workflow)"
            />
            <SlbButton
              variant="ghost"
              size="sm"
              icon-only
              icon-left="action_trash"
              :aria-label="`Delete ${workflow.name}`"
              @click="pendingDelete = workflow"
            />
          </div>
        </div>
      </article>
    </div>

    <SlbConfirmModal
      :model-value="pendingDelete !== null"
      title="Delete workflow"
      :message="`Delete ${pendingDelete?.name ?? 'this workflow'}? Its versions and execution history go too. This cannot be undone.`"
      confirm-label="Delete"
      danger
      :loading="deleting"
      @update:model-value="!$event && (pendingDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style lang="scss">
@use './workflow-list.scss';
</style>
