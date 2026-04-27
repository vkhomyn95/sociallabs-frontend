<template>
  <div class="workflow-canvas">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-zoom="1"
      :min-zoom="0.2"
      :max-zoom="4"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <Controls />
      <MiniMap />

      <template #node-custom="{ data }">
        <CustomNode
          :data="data"
          @delete="onDeleteNode"
          @configure="onConfigureNode"
          @open-sub-panel="onOpenSubPanel"
        />
      </template>

      <template #node-sub="{ data }">
        <SubNodeCard
          :data="data"
          @delete="onDeleteSubNode"
          @open-panel="onOpenSubPanel"
        />
      </template>
    </VueFlow>

    <NodeEditorModal
      :visible="!!selectedNode"
      :node="selectedNode"
      :input-data="{}"
      @close="selectedNode = null"
      @save="onUpdateNode"
    />

    <RightParameterPanel
      :visible="rightPanel.visible"
      :port-key="rightPanel.portKey"
      :agent-node="rightPanel.agentNode"
      @close="rightPanel.visible = false"
      @save="onRightPanelSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { storeToRefs } from 'pinia'

import { useWorkflowStore } from '@/stores/workflow'
import CustomNode from './CustomNode.vue'
import SubNodeCard from './SubNodeCard.vue'
import NodeEditorModal from '@/components/NodeEditorModal.vue'
import RightParameterPanel, { type SubPanelPortKey } from './RightParameterPanel.vue'

import { NodeDiscriminator, type NodeInstance, NodeType } from '@/stores/node/types'
import { ConnectionType, HANDLE_TO_CONNECTION_TYPE } from '@/stores/workflow/types'
import { generateNodeId } from '@/stores/node/utils'

// ─── Store ────────────────────────────────────────────────────────────────────
const workflowStore = useWorkflowStore()
const { nodes, edges } = storeToRefs(workflowStore)

// ─── Local state ──────────────────────────────────────────────────────────────
const selectedNode = ref<NodeInstance | null>(null)

const rightPanel = reactive<{
  visible:   boolean
  portKey:   SubPanelPortKey | null
  agentNode: NodeInstance | null
}>({ visible: false, portKey: null, agentNode: null })

// ─── Sub-node helpers ─────────────────────────────────────────────────────────
const SUB_TYPES = new Set<NodeType>([NodeType.AI_MODEL, NodeType.AI_MEMORY, NodeType.AI_TOOL])

function isSubNode(type: NodeType): boolean {
  return SUB_TYPES.has(type)
}

function typeToPortKey(type: NodeType): SubPanelPortKey | null {
  if (type === NodeType.AI_MODEL)  return 'ai_model'
  if (type === NodeType.AI_MEMORY) return 'ai_memory'
  if (type === NodeType.AI_TOOL)   return 'ai_tools'
  return null
}

// ─── Right panel ──────────────────────────────────────────────────────────────
function onOpenSubPanel(agentNodeId: string, portKey: string): void {
  const node = workflowStore.getNodeById(agentNodeId)
  if (!node) return
  rightPanel.agentNode = node
  rightPanel.portKey   = portKey as SubPanelPortKey
  rightPanel.visible   = true
}

const PORT_TO_SUBTYPE: Record<SubPanelPortKey, NodeType> = {
  ai_model:  NodeType.AI_MODEL,
  ai_memory: NodeType.AI_MEMORY,
  ai_tools:  NodeType.AI_TOOL,
}

const PORT_DISPLAY: Record<SubPanelPortKey, { name: string; offsetX: number }> = {
  ai_model:  { name: 'Chat Model', offsetX: -120 },
  ai_memory: { name: 'Memory',     offsetX:    0 },
  ai_tools:  { name: 'Tools',      offsetX:  120 },
}

function onRightPanelSave(agentNodeId: string, parameters: Record<string, any>): void {
  workflowStore.UPDATE_NODE(agentNodeId, { parameters })

  const agentNode = workflowStore.getNodeById(agentNodeId)
  if (!agentNode) return

  const portKey = rightPanel.portKey
  if (!portKey) return

  const shouldExist = isPortConfigured(portKey, parameters)
  const existing    = workflowStore.workflow?.nodes.find(n =>
    n.type === PORT_TO_SUBTYPE[portKey] &&
    n.parameters?.agentNodeId === agentNodeId
  )

  if (shouldExist && !existing) {
    const display = PORT_DISPLAY[portKey]
    workflowStore.ADD_NODE({
      nodeId:        generateNodeId(),
      discriminator: NodeDiscriminator.AI_AGENT,
      name:          display.name,
      type:          PORT_TO_SUBTYPE[portKey],
      position:      { x: agentNode.position.x + display.offsetX, y: agentNode.position.y + 130 },
      parameters:    { agentNodeId },
      disabled:      false,
    })
  } else if (!shouldExist && existing) {
    workflowStore.REMOVE_NODE(existing.nodeId)
  }

  const updated = workflowStore.getNodeById(agentNodeId)
  if (updated) rightPanel.agentNode = updated
}

function isPortConfigured(portKey: SubPanelPortKey, params: Record<string, any>): boolean {
  switch (portKey) {
    case 'ai_model':  return !!params.modelId?.modelId
    case 'ai_memory': return params.memory?.enabled === true
    case 'ai_tools':  return Array.isArray(params.toolNames) && params.toolNames.length > 0
  }
}

function onDeleteSubNode(subNodeId: string): void {
  const subNode = workflowStore.getNodeById(subNodeId)
  if (!subNode) return

  const agentNodeId = subNode.parameters?.agentNodeId as string | undefined
  const portKey     = typeToPortKey(subNode.type)

  workflowStore.REMOVE_NODE(subNodeId)

  if (agentNodeId && portKey) {
    const agentNode = workflowStore.getNodeById(agentNodeId)
    if (!agentNode) return

    const params = { ...agentNode.parameters }
    if (portKey === 'ai_model')  delete params.modelId
    if (portKey === 'ai_memory') params.memory    = { ...params.memory, enabled: false }
    if (portKey === 'ai_tools')  params.toolNames = []
    workflowStore.UPDATE_NODE(agentNodeId, { parameters: params })
  }
}

// ─── VueFlow event handlers ───────────────────────────────────────────────────
function onNodesChange(changes: any[]): void {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      workflowStore.UPDATE_NODE(change.id, { position: change.position })
    }
  }
}

function onEdgesChange(changes: any[]): void {
  for (const change of changes) {
    if (change.type !== 'remove') continue
    if (change.id.startsWith('sub-')) continue   // авто-edges — не чіпаємо

    const conn = workflowStore.workflow?.connections.find(
      c => `${c.sourceNodeId}-${c.sourceOutputIndex}-${c.targetNodeId}` === change.id
    )
    if (conn?.id) workflowStore.REMOVE_CONNECTION(conn.id)
  }
}

function onConnect(params: any): void {
  const targetHandle = (params.targetHandle as string) ?? '0'
  const isSubPort    = HANDLE_TO_CONNECTION_TYPE[targetHandle] !== undefined
  const connType     = isSubPort
    ? HANDLE_TO_CONNECTION_TYPE[targetHandle]
    : ConnectionType.MAIN

  workflowStore.ADD_CONNECTION({
    sourceNodeId:      params.source,
    targetNodeId:      params.target,
    sourceOutputIndex: Number(params.sourceHandle ?? 0),
    targetInputIndex:  isSubPort ? -1 : Number(targetHandle),
    targetHandle:      isSubPort ? targetHandle : undefined,
    type:              connType,
  })
}

function onNodeClick(event: any): void {
  const node = workflowStore.getNodeById(event.node.id)
  if (!node) return

  if (isSubNode(node.type)) {
    const portKey = typeToPortKey(node.type)
    if (portKey && node.parameters?.agentNodeId) {
      onOpenSubPanel(node.parameters.agentNodeId as string, portKey)
    }
    return
  }

  selectedNode.value = node
}

function onPaneClick(): void {
  selectedNode.value  = null
  rightPanel.visible  = false
}

function onDeleteNode(nodeId: string): void {
  workflowStore.REMOVE_NODE(nodeId)
  if (selectedNode.value?.nodeId === nodeId) selectedNode.value = null
}

function onConfigureNode(nodeId: string): void {
  const node = workflowStore.getNodeById(nodeId)
  if (node) selectedNode.value = node
}

function onUpdateNode(nodeId: string, updates: Partial<NodeInstance>): void {
  workflowStore.UPDATE_NODE(nodeId, updates)
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.workflow-canvas {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #f8f9fa;
  overflow: hidden;
}

.vue-flow__node,
.vue-flow__node-custom,
.vue-flow__node-sub {
  overflow: visible !important;
}
</style>
