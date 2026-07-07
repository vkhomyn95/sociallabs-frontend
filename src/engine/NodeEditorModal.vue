<script setup lang="ts">
/**
 * NodeEditorModal.vue
 *
 * Відкривається через useModal():
 *   const result = await modal.open(NodeEditorModal, { node }, { size: 'full' })
 *
 * При Save — resolve(updatedNode)
 * При Cancel — reject()
 */
import { computed, ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useWorkflowStore } from '@/stores/workflow'
import { NodeService } from '@/stores/node/service'
import type { NodeInstance } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'
import type { InputNode } from './NodeEditorInputPanel.vue'
import NodeEditorInputPanel from './NodeEditorInputPanel.vue'
import NodeEditorCenterPanel from './NodeEditorCenterPanel.vue'
import NodeEditorOutputPanel from './NodeEditorOutputPanel.vue'
import { SlbButton } from '@/components/ui'

// ── Props passed by ModalProvider ─────────────────────────────────────────────
const props = defineProps<{
  modalId: string
  node:    NodeInstance
}>()

const modalStore    = useWorkflowStore()  // to find previous nodes
const workflowStore = useWorkflowStore()
const modalStoreUi  = useModalStore()

// ── Local state ───────────────────────────────────────────────────────────────
const localNode  = ref<NodeInstance>(JSON.parse(JSON.stringify(props.node)))
const outputData = ref<Record<string, any>[] | null>(null)
const outputError = ref<string | null>(null)
const isTesting   = ref(false)

// ── Compute upstream nodes (all nodes that connect TO this node) ──────────────
const inputNodes = computed((): InputNode[] => {
  const workflow = workflowStore.workflow
  if (!workflow) return []

  // Find all source node IDs connected to current node
  const sourceIds = workflow.connections
    .filter(c => c.targetNodeId === props.node.nodeId)
    .map(c => c.sourceNodeId)

  return sourceIds.map(id => {
    const node = workflow.nodes.find(n => n.nodeId === id)
    return node
      ? { node, data: null, hasData: false }
      : null
  }).filter(Boolean) as InputNode[]
})

const nodeColor = computed(
  () => NodeColors[props.node.discriminator as keyof typeof NodeColors] ?? '#6b7280'
)
const nodeIcon = computed(
  () => NodeIcons[props.node.discriminator as keyof typeof NodeIcons] ?? 'fas fa-cube'
)

// ── Actions ───────────────────────────────────────────────────────────────────
async function executeStep() {
  isTesting.value   = true
  outputData.value  = null
  outputError.value = null

  try {
    const result = await NodeService.testNodeDefinition(localNode.value as any)
    if (result?.data) {
      outputData.value = Array.isArray(result.data) ? result.data : [result.data]
    } else {
      outputError.value = result?.error ?? 'No data returned'
    }
  } catch (e: any) {
    outputError.value = e.message ?? 'Unknown error'
  } finally {
    isTesting.value = false
  }
}

function onSave(updated: NodeInstance) {
  workflowStore.UPDATE_NODE(updated.nodeId, updated)
  modalStoreUi.close(props.modalId, updated)
}

function onClose() {
  modalStoreUi.dismiss(props.modalId)
}

function onNodeUpdate(updated: NodeInstance) {
  localNode.value = updated
}
</script>

<template>
  <div
    class="slb-ned"
    role="dialog"
    aria-modal="true"
    @click.stop
  >
    <!-- ── Header ── -->
    <div class="slb-ned__header">
      <div class="slb-ned__header-left">
        <div class="slb-ned__icon-badge" :style="{ background: NodeColors[localNode.discriminator] }">
          <i :class="NodeIcons[localNode.discriminator]"></i>
        </div>
        <div class="slb-ned__meta">
          <input
            class="slb-wf-toolbar__name"
            v-model="localNode!.name"
            placeholder="Node name"
          />
        </div>
      </div>

      <div class="slb-ned__header-actions">
        <SlbButton variant="danger" size="sm" @click="executeStep">
          <i :class="isTesting ? 'fas fa-spinner fa-spin' : 'fas fa-bolt'"></i>
          {{ isTesting ? 'Running...' : 'Execute step' }}
        </SlbButton>
        <button class="slb-ned__close-btn" aria-label="Close" @click="onClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- ── Three-column body ── -->
    <div class="slb-ned__body">
      <NodeEditorInputPanel
        :input-nodes="inputNodes"
        @execute-previous="executeStep"
      />

      <NodeEditorCenterPanel
        :node="localNode"
        @update:node="onNodeUpdate"
        @save="onSave"
        @close="onClose"
      />

      <NodeEditorOutputPanel
        :data="outputData"
        :error="outputError"
        :is-testing="isTesting"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use './node-editor.scss';
</style>
