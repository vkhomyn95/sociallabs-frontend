<template>
  <div class="workflow-canvas">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
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
import { useWorkflowStore } from '@/stores/workflow'
import CustomNode from './CustomNode.vue'
import SubNodeCard from './SubNodeCard.vue'
import NodeEditorModal from '@/components/NodeEditorModal.vue'
import RightParameterPanel, { type SubPanelPortKey } from './RightParameterPanel.vue'
import { NodeDiscriminator, type NodeInstance, NodeType } from '@/stores/node/types'
import type { Connection } from '@/stores/workflow/types'
import { ConnectionType, HANDLE_TO_CONNECTION_TYPE } from '@/stores/workflow/types'
import { generateNodeId } from '@/stores/node/utils'

const workflowStore = useWorkflowStore()
const selectedNode  = ref<NodeInstance | null>(null)

// ── Right panel ────────────────────────────────────────────────
const rightPanel = reactive<{
  visible:   boolean
  portKey:   SubPanelPortKey | null
  agentNode: NodeInstance | null
}>({ visible: false, portKey: null, agentNode: null })

function onOpenSubPanel(agentNodeId: string, portKey: string) {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === agentNodeId)
  if (!node) return
  rightPanel.agentNode = node
  rightPanel.portKey   = portKey as SubPanelPortKey
  rightPanel.visible   = true
}

// ── Sub-node sync ──────────────────────────────────────────────
// Маппінг portKey → NodeType і мета для відображення
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

/**
 * Після save в RightParameterPanel:
 * 1. Оновлюємо parameters AI_AGENT
 * 2. Синхронізуємо sub-ноди на canvas для цього portKey
 */
function onRightPanelSave(agentNodeId: string, parameters: Record<string, any>) {
  workflowStore.UPDATE_NODE(agentNodeId, { parameters })

  const agentNode = workflowStore.workflow?.nodes.find(n => n.nodeId === agentNodeId)
  if (!agentNode) return
  console.log(agentNode)
  const portKey = rightPanel.portKey
  if (!portKey) return

  // Визначаємо чи треба показувати sub-ноду для цього порту
  const shouldExist = isPortConfigured(portKey, parameters)

  // Знайти існуючу sub-ноду для цього agentNode + portKey
  const existing = workflowStore.workflow?.nodes.find(n =>
    n.type === PORT_TO_SUBTYPE[portKey] &&
    n.parameters?.agentNodeId === agentNodeId
  )

  if (shouldExist && !existing) {
    // Створити sub-ноду
    const newId = generateNodeId()
    const display = PORT_DISPLAY[portKey]
    const subType = PORT_TO_SUBTYPE[portKey]

    workflowStore.ADD_NODE({
      nodeId:        newId,
      discriminator: NodeDiscriminator.AI_AGENT, // reuse, тільки type різний
      name:          display.name,
      type:          subType,
      position: {x: agentNode.position.x + display.offsetX, y: agentNode.position.y + 130},
      parameters:    { agentNodeId },
      disabled:      false,
    })

  } else if (!shouldExist && existing) {
    // Видалити sub-ноду якщо параметр вимкнено
    workflowStore.REMOVE_NODE(existing.nodeId)
  }

  // Оновити agentNode в правій панелі
  const updated = workflowStore.workflow?.nodes.find(n => n.nodeId === agentNodeId)
  if (updated) rightPanel.agentNode = updated
}

/**
 * Чи є параметр для цього portKey "налаштованим" (потребує sub-ноди)
 */
function isPortConfigured(portKey: SubPanelPortKey, params: Record<string, any>): boolean {
  switch (portKey) {
    case 'ai_model':  return !!params.modelId?.modelId
    case 'ai_memory': return params.memory?.enabled === true
    case 'ai_tools':  return Array.isArray(params.toolNames) && params.toolNames.length > 0
  }
}

// Видалити sub-ноду вручну (кнопка ×) → скинути відповідний параметр
function onDeleteSubNode(subNodeId: string) {
  const subNode = workflowStore.workflow?.nodes.find(n => n.nodeId === subNodeId)
  if (!subNode) return

  const agentNodeId = subNode.parameters?.agentNodeId
  const portKey     = typeToPortKey(subNode.type)

  workflowStore.REMOVE_NODE(subNodeId)

  // Скинути parameter в AI_AGENT
  if (agentNodeId && portKey) {
    const agentNode = workflowStore.workflow?.nodes.find(n => n.nodeId === agentNodeId)
    if (!agentNode) return
    const params = { ...agentNode.parameters }
    if (portKey === 'ai_model')  delete params.modelId
    if (portKey === 'ai_memory') params.memory = { ...params.memory, enabled: false }
    if (portKey === 'ai_tools')  params.toolNames = []
    workflowStore.UPDATE_NODE(agentNodeId, { parameters: params })
  }
}

function typeToPortKey(type: NodeType): SubPanelPortKey | null {
  if (type === NodeType.AI_MODEL)  return 'ai_model'
  if (type === NodeType.AI_MEMORY) return 'ai_memory'
  if (type === NodeType.AI_TOOL)   return 'ai_tools'
  return null
}

// ── Port styles ────────────────────────────────────────────────
const PORT_STYLES: Record<number, { color: string }> = {
  0: { color: '#10b981' }, 1: { color: '#ef4444' }, 2: { color: '#f59e0b' },
  3: { color: '#8b5cf6' }, 4: { color: '#06b6d4' }, 5: { color: '#6366f1' },
}
function getPortStyle(index: number) { return PORT_STYLES[index] ?? { color: '#9ca3af' } }

function getEdgeLabel(conn: Connection, sourceNode?: NodeInstance): string {
  const d = sourceNode?.discriminator
  if (d === 'IF_LOGIC')     return conn.sourceOutputIndex === 0 ? 'true' : 'false'
  if (d === 'SWITCH_LOGIC') {
    const rules: Array<{ outputIndex: number; outputName?: string }> = sourceNode?.parameters?.rules ?? []
    const rule = rules.find(r => r.outputIndex === conn.sourceOutputIndex)
    return rule ? (rule.outputName || String(conn.sourceOutputIndex)) : 'fallback'
  }
  return ''
}

// ── Sub-node types set ─────────────────────────────────────────
const SUB_TYPES = new Set<NodeType>([NodeType.AI_MODEL, NodeType.AI_MEMORY, NodeType.AI_TOOL])
function isSubNode(type: NodeType) { return SUB_TYPES.has(type) }

// ── Sub-node accent color for edge ────────────────────────────
const SUB_TYPE_COLOR: Record<string, string> = {
  [NodeType.AI_MODEL]:  '#8b5cf6',
  [NodeType.AI_MEMORY]: '#06b6d4',
  [NodeType.AI_TOOL]:   '#10b981',
}

// ── Nodes ──────────────────────────────────────────────────────
const nodes = computed(() => {
  if (!workflowStore.workflow) return []
  return workflowStore.workflow.nodes.map(node => ({
    id:       node.nodeId,
    type:     isSubNode(node.type) ? 'sub' : 'custom',
    position: node.position,
    data:     { ...node, label: node.name },
  }))
})

// ── Edges ──────────────────────────────────────────────────────
// Автоматично генеруємо edge від sub-ноди до AI_AGENT
const edges = computed(() => {
  if (!workflowStore.workflow) return []

  const result: any[] = []

  // Звичайні connections
  for (const conn of workflowStore.workflow.connections) {
    const sourceNode = workflowStore.workflow.nodes.find(n => n.nodeId === conn.sourceNodeId)
    const portStyle  = getPortStyle(conn.sourceOutputIndex)
    const label      = getEdgeLabel(conn, sourceNode)

    result.push({
      id:           `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}`,
      source:       conn.sourceNodeId,
      target:       conn.targetNodeId,
      sourceHandle: String(conn.sourceOutputIndex),
      targetHandle: conn.targetHandle ?? String(conn.targetInputIndex),
      type:         'smoothstep',
      animated:     false,
      style:        { stroke: portStyle.color, strokeWidth: 1.5 },
      ...(label ? {
        label,
        labelStyle:          { fontWeight: '700', fontSize: '10px', fontFamily: 'inherit' },
        labelBgStyle:        { fill: '#f8f9fa' },
        labelBgPadding:      [4, 6] as [number, number],
        labelBgBorderRadius: 3,
      } : {}),
      markerEnd: { type: 'arrowclosed', color: portStyle.color, width: 16, height: 10 },
    })
  }

  // Edges від sub-нод до AI_AGENT (генеруємо автоматично, без збереження в store)
  for (const node of workflowStore.workflow.nodes) {
    if (!isSubNode(node.type)) continue
    const agentNodeId = node.parameters?.agentNodeId
    if (!agentNodeId) continue
    const portKey = typeToPortKey(node.type)
    if (!portKey) continue
    const color = SUB_TYPE_COLOR[node.type] ?? '#9ca3af'

    result.push({
      id:           `sub-${node.nodeId}-${agentNodeId}`,
      source:       node.nodeId,
      target:       agentNodeId,
      sourceHandle: '0',
      targetHandle: portKey,
      type:         'smoothstep',
      animated:     false,
      style:        { stroke: color, strokeWidth: 1.5, strokeDasharray: '4 3' },
      markerEnd:    { type: 'arrowclosed', color, width: 14, height: 9 },
    })
  }

  return result
})

// ── Event handlers ─────────────────────────────────────────────
const onNodesChange = (changes: any[]) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      workflowStore.UPDATE_NODE(change.id, { position: change.position })
    }
  })
}

const onEdgesChange = (changes: any[]) => {
  changes.forEach(change => {
    if (change.type === 'remove') {
      // Не видаляємо sub-node edges — вони автогенеровані
      if (change.id.startsWith('sub-')) return
      const edge = workflowStore.workflow?.connections.find(c =>
        `${c.sourceNodeId}-${c.sourceOutputIndex}-${c.targetNodeId}` === change.id
      )
      if (edge?.id) workflowStore.REMOVE_CONNECTION(edge.id)
    }
  })
}

const onConnect = (params: any) => {
  const targetHandle = params.targetHandle as string ?? '0'
  const isBottomPort = HANDLE_TO_CONNECTION_TYPE[targetHandle] !== undefined
  const connType     = isBottomPort ? HANDLE_TO_CONNECTION_TYPE[targetHandle] : ConnectionType.MAIN
  workflowStore.ADD_CONNECTION({
    sourceNodeId:      params.source,
    targetNodeId:      params.target,
    sourceOutputIndex: Number(params.sourceHandle ?? 0),
    targetInputIndex:  isBottomPort ? -1 : Number(targetHandle),
    targetHandle:      isBottomPort ? targetHandle : undefined,
    type:              connType,
  })
}

const onNodeClick = (event: any) => {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === event.node.id)
  if (!node) return
  // Sub-ноди відкривають правий panel, не NodeEditorModal
  if (isSubNode(node.type)) {
    const portKey = typeToPortKey(node.type)
    if (portKey && node.parameters?.agentNodeId) {
      onOpenSubPanel(node.parameters.agentNodeId, portKey)
    }
    return
  }
  selectedNode.value = node
}

const onPaneClick     = () => { selectedNode.value = null; rightPanel.visible = false }
const onDeleteNode    = (nodeId: string) => {
  workflowStore.REMOVE_NODE(nodeId)
  if (selectedNode.value?.nodeId === nodeId) selectedNode.value = null
}
const onConfigureNode = (nodeId: string) => {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === nodeId)
  if (node) selectedNode.value = node
}
const onUpdateNode = (nodeId: string, updates: Partial<NodeInstance>) => {
  workflowStore.UPDATE_NODE(nodeId, updates)
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.workflow-canvas {
  width: 100%; height: 100vh; position: relative;
  background: #f8f9fa; overflow: hidden;
}
.vue-flow__node { overflow: visible !important; }
.vue-flow__node-custom,
.vue-flow__node-sub { overflow: visible !important; }
</style>
