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
    <!-- Configuration Panel (справа 30%) -->
    <Transition name="slide-right">
      <ParameterPanel
        v-if="selectedNode"
        :node="selectedNode"
        @close="selectedNode = null"
        @update="onUpdateNode"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { useWorkflowStore } from '@/stores/workflow';
import CustomNode from './CustomNode.vue';
import ParameterPanel from './ParameterPanel.vue';
import type { NodeInstance } from '@/stores/workflow/types';
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

const workflowStore = useWorkflowStore();
const selectedNode = ref<NodeInstance | null>(null);

// Convert workflow nodes to VueFlow format
const nodes = computed(() => {
  if (!workflowStore.workflow) return [];

  return workflowStore.workflow.nodes.map(node => ({
    id: node.nodeId,
    type: 'custom',
    position: node.position,
    data: {
      ...node,
      label: node.name
    }
  }));
});

// Convert workflow connections to VueFlow format
const edges = computed(() => {
  if (!workflowStore.workflow) return [];

  return workflowStore.workflow.connections.map(conn => ({
    id: `${conn.sourceNodeId}-${conn.targetNodeId}`,
    source: conn.sourceNodeId,
    target: conn.targetNodeId,
    sourceHandle: conn.sourceOutput,
    targetHandle: conn.targetInput,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#b1b1b7', strokeWidth: 1 },
    markerEnd: {
      type: 'arrowclosed',
      color: '#b1b1b7',
      width: 20,
      height: 10
    }
  }));
});

// Handle node position changes
const onNodesChange = (changes: any[]) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      workflowStore.UPDATE_NODE(change.id, {
        position: change.position
      });
    }
  });
};

// Handle edge changes
const onEdgesChange = (changes: any[]) => {
  changes.forEach(change => {
    if (change.type === 'remove') {
      const edge = workflowStore.workflow?.connections.find(
        c => `${c.sourceNodeId}-${c.targetNodeId}` === change.id
      );
      if (edge?.id) {
        workflowStore.REMOVE_CONNECTION(edge.id);
      }
    }
  });
};

// Handle new connection
const onConnect = (params: any) => {
  workflowStore.ADD_CONNECTION({
    sourceNodeId: params.source,
    targetNodeId: params.target,
    sourceOutput: params.sourceHandle || 'main',
    targetInput: params.targetHandle || 'main'
  });
};

// Handle node click
const onNodeClick = (event: any) => {
  const node = workflowStore.workflow?.nodes.find(n => n.id === event.node.id);
  if (node) {
    selectedNode.value = node;
  }
};

// Handle pane click (deselect)
const onPaneClick = () => {
  selectedNode.value = null;
};

// Handle node deletion
const onDeleteNode = (nodeId: string) => {
  workflowStore.REMOVE_NODE(nodeId);
  if (selectedNode.value?.id === nodeId) {
    selectedNode.value = null;
  }
};

// Handle node configuration
const onConfigureNode = (nodeId: string) => {
  const node = workflowStore.workflow?.nodes.find(n => n.id === nodeId);
  if (node) {
    selectedNode.value = node;
  }
};

// Handle node update
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
