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

      <!-- Custom Node Template -->
      <template #node-custom="{ data }">
        <CustomNode
          :data="data"
          @delete="onDeleteNode"
          @configure="onConfigureNode"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '@/stores/workflow'
import CustomNode from './CustomNode.vue'
import NodeEditorModal from '@/components/NodeEditorModal.vue'
import type { NodeInstance } from '@/stores/node/types'
import type { Connection } from '@/stores/workflow/types'
import { ConnectionType, HANDLE_TO_CONNECTION_TYPE } from '@/stores/workflow/types'
import { SUB_SLOT_TARGET_INDEX } from '@/stores/node/types'

const workflowStore = useWorkflowStore()
const selectedNode = ref<NodeInstance | null>(null)

// ── Port index → visual style ──────────────────────────────────
//
// Конвенція індексів портів:
//   Звичайна нода : sourceOutputIndex=0  (main)
//   IF нода       : sourceOutputIndex=0  (true), sourceOutputIndex=1 (false)
//   Switch нода   : sourceOutputIndex=0,1,2... (rules), last = fallback
//
const PORT_STYLES: Record<number, { color: string; label: string }> = {
  0: { color: '#10b981', label: '' },   // main / true — зелений, без лейбла
  1: { color: '#ef4444', label: '' },   // false — червоний
  2: { color: '#f59e0b', label: '' },
  3: { color: '#8b5cf6', label: '' },
  4: { color: '#06b6d4', label: '' },
  5: { color: '#6366f1', label: '' },
}
const FALLBACK_PORT_STYLE = { color: '#9ca3af', label: 'fallback' }

function getPortStyle(index: number) {
  return PORT_STYLES[index] ?? FALLBACK_PORT_STYLE
}

/**
 * Повертає відображувану назву порту для ребра.
 * Для IF ноди порт 0 = "true", порт 1 = "false".
 * Для Switch — береться з rules ноди (якщо є).
 */
function getEdgeLabel(
  conn: Connection,
  sourceNode?: NodeInstance
): string {
  const discriminator = sourceNode?.discriminator

  if (discriminator === 'if_logic') {
    return conn.sourceOutputIndex === 0 ? 'true' : 'false'
  }

  if (discriminator === 'switch_logic') {
    const rules: Array<{ outputIndex: number; outputName?: string }> =
      sourceNode?.parameters?.rules ?? []
    const rule = rules.find(r => r.outputIndex === conn.sourceOutputIndex)
    if (rule) return rule.outputName || String(conn.sourceOutputIndex)
    // останній порт — fallback
    return 'fallback'
  }

  return '' // звичайна нода — без лейбла
}

// ── Nodes ──────────────────────────────────────────────────────
const nodes = computed(() => {
  if (!workflowStore.workflow) return []
  return workflowStore.workflow?.nodes.map(node => ({
    id: node.nodeId,
    type: 'custom',
    position: node.position,
    data: { ...node, label: node.name },
  }))
})

// ── Edges ──────────────────────────────────────────────────────
const edges = computed(() => {
  if (!workflowStore.workflow) return []

  return workflowStore.workflow.connections.map(conn => {
    const sourceNode = workflowStore.workflow!.nodes.find(
      n => n.nodeId === conn.sourceNodeId
    )

    const portStyle = getPortStyle(conn.sourceOutputIndex)
    const label     = getEdgeLabel(conn, sourceNode)

    return {
      id: `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}`,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      // Handle ID — рядок, бо VueFlow вимагає string
      sourceHandle: String(conn.sourceOutputIndex),
      targetHandle: String(conn.targetInputIndex),
      type: 'smoothstep',
      animated: false,
      style: { stroke: portStyle.color, strokeWidth: 1.5 },
      ...(label ? {
        label,
        labelStyle: { fontWeight: '700', fontSize: '10px', fontFamily: 'inherit' },
        labelBgStyle: { fill: '#f8f9fa' },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 3,
      } : {}),
      markerEnd: {
        type: 'arrowclosed',
        color: portStyle.color,
        width: 16,
        height: 10,
      },
    }
  })
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
      // ID формат: `${sourceNodeId}-${sourceOutputIndex}-${targetNodeId}`
      const edge = workflowStore.workflow?.connections.find(c =>
        `${c.sourceNodeId}-${c.sourceOutputIndex}-${c.targetNodeId}` === change.id
      )
      if (edge?.id) workflowStore.REMOVE_CONNECTION(edge.id)
    }
  })
}

const onConnect = (params: any) => {
  const targetHandle = params.targetHandle as string ?? '0'
  // bottom ports мають handle id = output key ('model', 'memory', 'tools')
  const isBottomPort = HANDLE_TO_CONNECTION_TYPE[targetHandle] !== undefined
  const connType     = isBottomPort
    ? HANDLE_TO_CONNECTION_TYPE[targetHandle]
    : ConnectionType.MAIN

  workflowStore.ADD_CONNECTION({
    sourceNodeId:      params.source,
    targetNodeId:      params.target,
    sourceOutputIndex: Number(params.sourceHandle ?? 0),
    targetInputIndex:  isBottomPort ? -1 : Number(targetHandle),
    type:              connType,
  })
}

const onNodeClick  = (event: any) => {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === event.node.id)
  if (node) selectedNode.value = node
}
const onPaneClick  = () => { selectedNode.value = null }
const onDeleteNode = (nodeId: string) => {
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
  width: 100%;
  height: 100vh;
  position: relative;
  background: #f8f9fa;
}

/*
  CRITICAL FIX: VueFlow wraps each node in .vue-flow__node which has
  overflow:hidden by default — this clips our outside labels.
  Override it globally so labels/handles can render past the node boundary.
*/
.vue-flow__node {
  overflow: visible !important;
}
.vue-flow__node-custom {
  overflow: visible !important;
}
</style>
