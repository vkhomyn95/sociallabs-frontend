<template>
  <div class="slb_workflow-canvas">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-zoom="1"
      :min-zoom="0.2"
      :max-zoom="4"
      :default-edge-options="{ type: 'labeled' }"
      @nodes-change="NODE_CHANGE"
      @edges-change="CHANGE_EDGE"
      @connect="CONNECT_NODE"
      @node-click="CLICK_NODE"
      @pane-click="currentNodeId = undefined"
    >
      <Background pattern-color="#d1d5db" :gap="20" />
      <Controls />
      <MiniMap />

      <template #node-custom="nodeProps">
        <BaseNode
          :data="nodeProps.data"
          :source-position="nodeProps.sourcePosition"
          :target-position="nodeProps.targetPosition"
          @delete="DELETE_NODE"
          @execute="onExecuteNode"
        />
      </template>

      <template #node-agent="nodeProps">
        <AgentNode
          :data="nodeProps.data"
          :source-position="nodeProps.sourcePosition"
          :target-position="nodeProps.targetPosition"
          @delete="DELETE_NODE"
          @execute="onExecuteNode"
        />
      </template>

      <template #node-if="nodeProps">
        <IfNode
          :data="nodeProps.data"
          :source-position="nodeProps.sourcePosition"
          :target-position="nodeProps.targetPosition"
          @delete="DELETE_NODE"
          @execute="onExecuteNode"
        />
      </template>

      <template #node-switch="nodeProps">
        <SwitchNode
          :data="nodeProps.data"
          :source-position="nodeProps.sourcePosition"
          :target-position="nodeProps.targetPosition"
          @delete="DELETE_NODE"
          @execute="onExecuteNode"
        />
      </template>

<!--      <template #node-sub="nodeProps">-->
<!--        <SubNodeCard-->
<!--          :data="nodeProps.data"-->
<!--          @delete="onDeleteSubNode"-->
<!--          @open-panel="onOpenSubPanel"-->
<!--        />-->
<!--      </template>-->

      <template #edge-labeled="edgeProps">
        <LabeledEdge v-bind="edgeProps" @remove="REMOVE_EDGE" />
      </template>

      <template #edge-workflow="edgeProps">
        <WorkflowEdge v-bind="edgeProps" @remove="REMOVE_EDGE" />
      </template>
    </VueFlow>

    <div class="slb_workflow-controls">
      <button
        v-if="isRunning"
        class="slb_workflow-controls__btn slb_workflow-controls__btn--stop"
        @click="stopWorkflow"
      >
        <i class="fas fa-stop"></i>
        <span class="slb_workflow-controls__spinner"></span>
      </button>
      <button
        v-else
        class="slb_workflow-controls__btn slb_workflow-controls__btn--run"
        @click="runWorkflow"
      >
        <i class="fas fa-play"></i>
      </button>
      <button class="slb_workflow-controls__btn" @click="resetWorkflow" title="Reset">
        <i class="fas fa-undo"></i>
      </button>
    </div>

<!--    <NodeEditorModal-->
<!--      v-if="selectedNode"-->
<!--      :visible="!!selectedNode"-->
<!--      :node="selectedNode"-->
<!--      :input-data="{}"-->
<!--      @close="selectedNode = null"-->
<!--      @save="onUpdateNode"-->
<!--    />-->

    <!--    <RightParameterPanel-->
    <!--      :visible="rightPanel.visible"-->
    <!--      :port-key="rightPanel.portKey"-->
    <!--      :agent-node="rightPanel.agentNode"-->
    <!--      @close="rightPanel.visible = false"-->
    <!--      @save="onRightPanelSave"-->
    <!--    />-->
  </div>
</template>

<script setup lang="ts">
// import { reactive, ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

import { useWorkflowStore } from '@/stores/workflow'
import { useWorkflowRunner } from '@/composables/useWorkflowRunner'
// import { type NodeInstance, NodeType } from '@/stores/node/types'

import BaseNode from './nodes/BaseNode.vue'
import AgentNode from './nodes/AgentNode.vue'
import IfNode from './nodes/IfNode.vue'
import SwitchNode from './nodes/SwitchNode.vue'
// import SubNodeCard from './nodes/SubNodeCard.vue'
import LabeledEdge from './edge/LabeledEdge.vue'
import WorkflowEdge from './edge/WorkflowEdge.vue'
// import NodeEditorModal from '@/components/NodeEditorModal.vue'
import { storeToRefs } from 'pinia'
// import BaseConnection from '@/components/connection/BaseConnection.vue'
// import RightParameterPanel, { type SubPanelPortKey } from './RightParameterPanel.vue'

const workflowStore = useWorkflowStore()
const {
  nodes,
  edges,
  currentNodeId
} = storeToRefs(workflowStore);
const {
  CONNECT_NODE,
  CHANGE_EDGE,
  REMOVE_EDGE,
  NODE_CHANGE,
  CLICK_NODE,
  DELETE_NODE
} = workflowStore;



const { run, stop, reset, isRunning } = useWorkflowRunner()
// const selectedNode = ref<NodeInstance | null>(null)

// const rightPanel = reactive<{
//   visible: boolean
//   portKey: SubPanelPortKey | null
//   agentNode: NodeInstance | null
// }>({ visible: false, portKey: null, agentNode: null })
//
// function onOpenSubPanel(agentNodeId: string, portKey: string) {
//   const node = workflowStore.workflow?.nodes.find((n) => n.nodeId === agentNodeId)
//   if (!node) return
//   rightPanel.agentNode = node
//   rightPanel.portKey = portKey as SubPanelPortKey
//   rightPanel.visible = true
// }

// ── Sub-node helpers ──
// const SUB_TYPES = new Set<NodeType>([NodeType.AI_MODEL, NodeType.AI_MEMORY, NodeType.AI_TOOL])
// const PORT_TO_SUBTYPE: Record<string, NodeType> = {
//   ai_model: NodeType.AI_MODEL,
//   ai_memory: NodeType.AI_MEMORY,
//   ai_tools: NodeType.AI_TOOL,
// }
// const PORT_DISPLAY: Record<string, { name: string; offsetX: number }> = {
//   ai_model: { name: 'Chat Model', offsetX: -120 },
//   ai_memory: { name: 'Memory', offsetX: 0 },
//   ai_tools: { name: 'Tools', offsetX: 120 },
// }
// const SUB_TYPE_COLOR: Record<string, string> = {
//   [NodeType.AI_MODEL]: '#8b5cf6',
//   [NodeType.AI_MEMORY]: '#06b6d4',
//   [NodeType.AI_TOOL]: '#10b981',
// }

// function isSubNode(type: NodeType) {
//   return SUB_TYPES.has(type)
// }

// function typeToPortKey(type: NodeType): SubPanelPortKey | null {
//   if (type === NodeType.AI_MODEL) return 'ai_model'
//   if (type === NodeType.AI_MEMORY) return 'ai_memory'
//   if (type === NodeType.AI_TOOL) return 'ai_tools'
//   return null
// }

// function isPortConfigured(portKey: string, params: Record<string, any>): boolean {
//   if (portKey === 'ai_model') return !!params.modelId?.modelId
//   if (portKey === 'ai_memory') return params.memory?.enabled === true
//   if (portKey === 'ai_tools') return Array.isArray(params.toolNames) && params.toolNames.length > 0
//   return false
// }

// function onRightPanelSave(agentNodeId: string, parameters: Record<string, any>) {
//   workflowStore.UPDATE_NODE(agentNodeId, { parameters })
//   const agentNode = workflowStore.workflow?.nodes.find((n) => n.nodeId === agentNodeId)
//   if (!agentNode) return
//   const portKey = rightPanel.portKey
//   if (!portKey) return
//   const shouldExist = isPortConfigured(portKey, parameters)
//   const existing = workflowStore.workflow?.nodes.find(
//     (n) => n.type === PORT_TO_SUBTYPE[portKey] && n.parameters?.agentNodeId === agentNodeId,
//   )
//   if (shouldExist && !existing) {
//     const display = PORT_DISPLAY[portKey]
//     workflowStore.ADD_NODE({
//       nodeId: generateNodeId(),
//       discriminator: NodeDiscriminator.AI_AGENT,
//       name: display.name,
//       type: PORT_TO_SUBTYPE[portKey],
//       position: { x: agentNode.position.x + display.offsetX, y: agentNode.position.y + 160 },
//       parameters: { agentNodeId },
//       disabled: false,
//     })
//   } else if (!shouldExist && existing) {
//     workflowStore.REMOVE_NODE(existing.nodeId)
//   }
//   const updated = workflowStore.workflow?.nodes.find((n) => n.nodeId === agentNodeId)
//   if (updated) rightPanel.agentNode = updated
// }

// function onDeleteSubNode(subNodeId: string) {
//   const subNode = workflowStore.workflow?.nodes.find((n) => n.nodeId === subNodeId)
//   if (!subNode) return
//   const agentNodeId = subNode.parameters?.agentNodeId
//   const portKey = typeToPortKey(subNode.type)
//   workflowStore.REMOVE_NODE(subNodeId)
//   if (agentNodeId && portKey) {
//     const agentNode = workflowStore.workflow?.nodes.find((n) => n.nodeId === agentNodeId)
//     if (!agentNode) return
//     const params = { ...agentNode.parameters }
//     if (portKey === 'ai_model') delete params.modelId
//     if (portKey === 'ai_memory') params.memory = { ...params.memory, enabled: false }
//     if (portKey === 'ai_tools') params.toolNames = []
//     workflowStore.UPDATE_NODE(agentNodeId, { parameters: params })
//   }
// }

// ── Node type resolver ──
// function resolveNodeType(node: NodeInstance): string {
//   if (isSubNode(node.type)) return 'sub'
//   if (node.discriminator === 'IF_LOGIC') return 'if'
//   if (node.discriminator === 'SWITCH_LOGIC') return 'switch'
//   if (node.type === NodeType.AI_AGENT) return 'agent'
//   return 'custom'
// }

// ── Edge label / color ──
// function resolveEdgeLabel(src: NodeInstance | undefined, idx: number): string {
//   if (!src) return ''
//   if (src.discriminator === NodeDiscriminator.IF_LOGIC) return idx === 0 ? 'true' : 'false'
//   if (src.discriminator === NodeDiscriminator.SWITCH_LOGIC) {
//     const rules: Array<{ outputIndex: number; outputName?: string }> = src.parameters?.rules ?? []
//     const rule = rules.find((r) => r.outputIndex === idx)
//     return rule ? rule.outputName || String(idx) : 'Fallback'
//   }
//   return ''
// }

// const PORT_COLORS: Record<number, string> = {
//   0: '#10b981',
//   1: '#ef4444',
//   2: '#f59e0b',
//   3: '#8b5cf6',
//   4: '#06b6d4',
//   5: '#6366f1',
// }

// function resolveEdgeColor(src: NodeInstance | undefined, idx: number): string {
//   if (src?.discriminator === 'IF_LOGIC') return idx === 0 ? '#10b981' : '#ef4444'
//   return PORT_COLORS[idx] ?? '#9ca3af'
// }

// ── Nodes ──
// const nodes = computed(() => {
//   if (!workflowStore.workflow) return []
//   return workflowStore.workflow.nodes.map((node) => ({
//     id: node.nodeId,
//     type: resolveNodeType(node),
//     position: node.position,
//     data: { ...node, label: node.name },
//   }))
// })

// ── Edges ──
// const edges = computed(() => {
//   if (!workflowStore.workflow) return []
//   const result: any[] = []
//
//   for (const conn of workflowStore.workflow.connections) {
//     const src = workflowStore.workflow.nodes.find((n) => n.nodeId === conn.sourceNodeId)
//     const color = resolveEdgeColor(src, conn.sourceOutputIndex)
//     const label = resolveEdgeLabel(src, conn.sourceOutputIndex)
//     console.log(color)
//     result.push({
//       id: `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}`,
//       source: conn.sourceNodeId,
//       target: conn.targetNodeId,
//       sourceHandle: String(conn.sourceOutputIndex),
//       targetHandle: conn.targetHandle ?? String(conn.targetInputIndex),
//       type: 'labeled',
//       data: {
//         color,
//         // ← не передаємо label зовсім, бо він вже видно на ноді через MultiOutputHandle
//         label: label || undefined, // ВИДАЛИТИ або закоментувати
//         connectionId: conn.id,
//       },
//       markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 9 },
//     })
//   }
//
//   for (const node of workflowStore.workflow.nodes) {
//     if (!isSubNode(node.type)) continue
//     const agentNodeId = node.parameters?.agentNodeId
//     if (!agentNodeId) continue
//     const portKey = typeToPortKey(node.type)
//     if (!portKey) continue
//     const color = SUB_TYPE_COLOR[node.type] ?? '#9ca3af'
//     result.push({
//       id: `sub-${node.nodeId}-${agentNodeId}`,
//       source: node.nodeId,
//       target: agentNodeId,
//       sourceHandle: '0',
//       targetHandle: portKey,
//       type: 'workflow',
//       data: { color, isSubEdge: true, dashed: true },
//       markerEnd: { type: MarkerType.ArrowClosed, color, width: 12, height: 8 },
//     })
//   }
//
//   return result
// })

// ── Event handlers ──
// const onNodesChange = (changes: any[]) => {
//   changes.forEach((c) => {
//     if (c.type === 'position' && c.position) {
//       workflowStore.UPDATE_NODE(c.id, { position: c.position })
//     }
//   })
// }

// const onEdgesChange = (changes: any[]) => {
//   changes.forEach((c) => {
//     if (c.type === 'remove') {
//       if (c.id.startsWith('sub-')) return
//       const edge = workflowStore.workflow?.connections.find(
//         (conn) => `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}` === c.id,
//       )
//       if (edge?.id) workflowStore.REMOVE_CONNECTION(edge.id)
//     }
//   })
// }

// const onConnect = (params: any) => {
//   const th = (params.targetHandle as string) ?? '0'
//   const isBottom = HANDLE_TO_CONNECTION_TYPE[th] !== undefined
//   const connType = isBottom ? HANDLE_TO_CONNECTION_TYPE[th] : ConnectionType.MAIN
//   workflowStore.ADD_CONNECTION({
//     sourceNodeId: params.source,
//     targetNodeId: params.target,
//     sourceOutputIndex: Number(params.sourceHandle ?? 0),
//     targetInputIndex: isBottom ? -1 : Number(th),
//     targetHandle: isBottom ? th : undefined,
//     type: connType,
//   })
// }

// const onNodeClick = (event: any) => {
//   const node = workflowStore.workflow?.nodes.find((n) => n.nodeId === event.node.id)
//   if (!node) return
//   if (isSubNode(node.type)) {
//     const pk = typeToPortKey(node.type)
//     if (pk && node.parameters?.agentNodeId) onOpenSubPanel(node.parameters.agentNodeId, pk)
//     return
//   }
//   selectedNode.value = node
// }

// const onPaneClick = () => {
//   selectedNode.value = null
//   rightPanel.visible = false
// }
// const onDeleteNode = (nodeId: string) => {
//   workflowStore.REMOVE_NODE(nodeId)
//   if (selectedNode.value?.nodeId === nodeId) selectedNode.value = null
// }
// const onConfigureNode = (nodeId: string) => {
//   selectedNode.value = workflowStore.workflow?.nodes.find((n) => n.nodeId === nodeId) ?? null
// }
// const onUpdateNode = (nodeId: string, updates: Partial<NodeInstance>) => {
//   workflowStore.UPDATE_NODE(nodeId, updates)
// }
const onExecuteNode = (_nodeId: string) => {}
// const onRemoveEdge = (edgeId: string) => {
//   if (edgeId.startsWith('sub-')) return
//   const conn = workflowStore.workflow?.connections.find(
//     (c) => `${c.sourceNodeId}-${c.sourceOutputIndex}-${c.targetNodeId}` === edgeId,
//   )
//   if (conn?.id) workflowStore.REMOVE_CONNECTION(conn.id)
// }

async function runWorkflow() {
  await run(nodes.value as any)
}

async function stopWorkflow() {
  await stop()
}

function resetWorkflow() {
  reset(nodes.value as any)
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.slb_workflow-canvas {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #f9fafb;
  overflow: hidden;
}

.vue-flow__node {
  overflow: visible !important;
}

.vue-flow__node-custom,
.vue-flow__node-agent,
.vue-flow__node-if,
.vue-flow__node-switch,
.vue-flow__node-sub {
  overflow: visible !important;
}

.slb_workflow-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
  background: white;
  padding: 8px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.slb_workflow-controls__btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition:
    background 0.15s,
    color 0.15s;
  position: relative;
}

.slb_workflow-controls__btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.slb_workflow-controls__btn--run {
  background: #10b981;
  color: white;
}

.slb_workflow-controls__btn--run:hover {
  background: #059669;
}

.slb_workflow-controls__btn--stop {
  background: #ef4444;
  color: white;
}

.slb_workflow-controls__btn--stop i {
  display: none;
}

.slb_workflow-controls__btn--stop:hover i {
  display: block;
}

.slb_workflow-controls__btn--stop:hover .slb_workflow-controls__spinner {
  display: none;
}

.slb_workflow-controls__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: slb-canvas-spin 0.8s linear infinite;
}

@keyframes slb-canvas-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
