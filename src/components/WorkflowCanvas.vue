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
import { useWorkflowStore } from '@/stores/workflow'
import CustomNode from './CustomNode.vue'
import type { NodeInstance } from '@/stores/workflow/types'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import NodeEditorModal from '@/components/NodeEditorModal.vue'

const workflowStore = useWorkflowStore()
const selectedNode = ref<NodeInstance | null>(null)

// ── Edge styling helpers ───────────────────────────────────────

const OUTPUT_STYLES: Record<string, { color: string; label: string }> = {
  true:    { color: '#10b981', label: 'true' },
  false:   { color: '#ef4444', label: 'false' },
  '0':     { color: '#6366f1', label: '0' },
  '1':     { color: '#10b981', label: '1' },
  '2':     { color: '#f59e0b', label: '2' },
  '3':     { color: '#ef4444', label: '3' },
  '4':     { color: '#8b5cf6', label: '4' },
  '5':     { color: '#06b6d4', label: '5' },
  default: { color: '#9ca3af', label: 'default' },
  main:    { color: '#b1b1b7', label: '' },
}

function getEdgeStyle(sourceOutput: string) {
  const s = OUTPUT_STYLES[sourceOutput] ?? OUTPUT_STYLES['main']
  return {
    stroke: s.color,
    strokeWidth: 1.5,
  }
}

function getEdgeLabel(sourceOutput: string): string {
  if (!sourceOutput || sourceOutput === 'main') return ''
  return OUTPUT_STYLES[sourceOutput]?.label ?? sourceOutput
}

function getEdgeLabelStyle(sourceOutput: string): Record<string, string> {
  // const color = OUTPUT_STYLES[sourceOutput]?.color ?? '#10b981'
  return {
    // fill: '#b1b1b7',
    fontWeight: '700',
    fontSize: '10px',
    fontFamily: 'inherit',
  }
}

function getEdgeLabelBgStyle(sourceOutput: string): Record<string, string> {
  return {
    fill: '#f8f9fa',
    // fillOpacity: '0.85',
    // rx: '3',
  }
}

// ── Nodes ──────────────────────────────────────────────────────
const nodes = computed(() => {
  if (!workflowStore.workflow) return []
  return workflowStore.workflow.nodes.map(node => ({
    id: node.nodeId,
    type: 'custom',
    position: node.position,
    data: { ...node, label: node.name }
  }))
})

// ── Edges ──────────────────────────────────────────────────────
const edges = computed(() => {
  if (!workflowStore.workflow) return []

  return workflowStore.workflow.connections.map(conn => {
    const sourceOutput = conn.sourceOutput || 'main'
    const label = getEdgeLabel(sourceOutput)

    return {
      id: `${conn.sourceNodeId}-${sourceOutput}-${conn.targetNodeId}`,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      sourceHandle: sourceOutput,
      targetHandle: conn.targetInput || 'main',
      type: 'smoothstep',
      animated: false,
      style: getEdgeStyle(sourceOutput),
      // Show label only for non-main outputs
      ...(label ? {
        label,
        labelStyle: getEdgeLabelStyle(sourceOutput),
        labelBgStyle: getEdgeLabelBgStyle(sourceOutput),
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 3,
      } : {}),
      markerEnd: {
        type: 'arrowclosed',
        color: getEdgeStyle(sourceOutput).stroke,
        width: 16,
        height: 10,
      }
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
      const edge = workflowStore.workflow?.connections.find(c => {
        const sourceOutput = c.sourceOutput || 'main'
        return `${c.sourceNodeId}-${sourceOutput}-${c.targetNodeId}` === change.id
      })
      if (edge?.id) workflowStore.REMOVE_CONNECTION(edge.id)
    }
  })
}

const onConnect = (params: any) => {
  workflowStore.ADD_CONNECTION({
    sourceNodeId: params.source,
    targetNodeId: params.target,
    sourceOutput: params.sourceHandle || 'main',
    targetInput: params.targetHandle || 'main',
  })
}

const onNodeClick = (event: any) => {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === event.node.id)
  if (node) selectedNode.value = node
}

const onPaneClick = () => {
  selectedNode.value = null
}

const onDeleteNode = (nodeId: string) => {
  workflowStore.REMOVE_NODE(nodeId)
  if (selectedNode.value?.nodeId === nodeId) selectedNode.value = null
}

const onConfigureNode = (nodeId: string) => {
  const node = workflowStore.workflow?.nodes.find(n => n.nodeId === nodeId)
  if (node) selectedNode.value = node
}

const onUpdateNode = (nodeId: string, updates: Partial<NodeInstance>) => {
  console.log(nodeId, updates)
  workflowStore.UPDATE_NODE(nodeId, updates);
};
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
