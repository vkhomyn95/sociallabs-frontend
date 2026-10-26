<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { VueFlow, useVueFlow, type Connection, type NodeDragEvent } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ConnectRejection, type WorkflowEditorSession } from '@/core/editor/WorkflowEditorSession'
import { connectionTypeFor } from '@/core/node-types/ports'
import type { ExecutionTracker } from '@/core/execution/ExecutionTracker'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { ConnectionType, type NodeId, type Position } from '@/core/workflow/model'
import { CanvasModelFactory, EDGE_TYPE, handleIndex, NODE_TYPE, type CanvasNodeData } from './canvasModel'
import { CanvasProjection, type CanvasPort } from './CanvasProjection'
import WorkflowNodeCard from './nodes/WorkflowNodeCard.vue'
import WorkflowEdge from './edges/WorkflowEdge.vue'
import { NODE_TYPE_DRAG_FORMAT } from '../palette/dragFormat'

/** Vue Flow adapter: renders the session's document through a projection and turns gestures into commands. */
const props = defineProps<{
  session: WorkflowEditorSession
  catalog: NodeTypeCatalog
  tracker: ExecutionTracker
}>()

const emit = defineEmits<{
  open: [nodeId: NodeId]
  rejected: [reason: ConnectRejection]
}>()

const flowId = `workflow-${props.session.workflowId}`
const flow = useVueFlow(flowId)
let projection: CanvasProjection | null = null

const canvasPort: CanvasPort = {
  setNodes: (nodes) => flow.setNodes(nodes),
  setEdges: (edges) => flow.setEdges(edges),
  addNodes: (nodes) => flow.addNodes(nodes),
  removeNodes: (ids) => flow.removeNodes(ids),
  updateNode: (id, update) => flow.updateNode(id, update),
  addEdges: (edges) => flow.addEdges(edges),
  removeEdges: (ids) => flow.removeEdges(ids),
  updateEdgeData: (id, data) => flow.updateEdgeData(id, data, { replace: true }),
}

// Nodes are added after the pane is ready, so fit once when the first batch has been measured.
let fitted = false
flow.onNodesInitialized(() => {
  if (fitted) return
  fitted = true
  void flow.fitView({ maxZoom: 1, padding: 0.2 })
})

onMounted(() => {
  projection = new CanvasProjection(props.session.document, new CanvasModelFactory(props.catalog), canvasPort, props.tracker)
  projection.render()
})

onBeforeUnmount(() => projection?.dispose())

function onConnect(connection: Connection): void {
  const sourceOutput = handleIndex(connection.sourceHandle)
  const targetInput = handleIndex(connection.targetHandle)
  const sourcePort = projection?.dataOf(connection.source)?.outputs.find((p) => p.index === sourceOutput)
  const targetPort = projection?.dataOf(connection.target)?.inputs.find((p) => p.index === targetInput)
  const type = sourcePort && targetPort ? connectionTypeFor(sourcePort, targetPort) : ConnectionType.MAIN
  if (!type) {
    emit('rejected', ConnectRejection.PORT_KIND)
    return
  }
  const rejection = props.session.connect({ source: connection.source, sourceOutput, target: connection.target, targetInput, type })
  if (rejection) emit('rejected', rejection)
}

function onDragStop(event: NodeDragEvent): void {
  props.session.move(new Map(event.nodes.map((node) => [node.id, { ...node.position }])))
}

function onDrop(event: DragEvent): void {
  const key = event.dataTransfer?.getData(NODE_TYPE_DRAG_FORMAT)
  const type = key ? props.catalog.get(key) : undefined
  if (!type) return
  const position: Position = flow.screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  props.session.addNode(type, { x: position.x - 110, y: position.y - 32 })
}

function onDragOver(event: DragEvent): void {
  if (event.dataTransfer?.types.includes(NODE_TYPE_DRAG_FORMAT)) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }
}

/** Delete the selected nodes and connections as one undo step. */
function deleteSelection(): void {
  props.session.remove(
    flow.getSelectedNodes.value.map((node) => node.id),
    flow.getSelectedEdges.value.map((edge) => edge.id),
  )
}

/** @returns centre of the visible area in flow coordinates, where palette clicks put new nodes */
function viewportCentre(): Position {
  const { x, y, zoom } = flow.viewport.value
  const { width, height } = flow.dimensions.value
  return { x: (width / 2 - x) / zoom - 110, y: (height / 2 - y) / zoom - 32 }
}

defineExpose({ deleteSelection, viewportCentre })
</script>

<template>
  <div class="wf-canvas" @drop="onDrop" @dragover="onDragOver">
    <VueFlow
      :id="flowId"
      :delete-key-code="null"
      :only-render-visible-elements="true"
      :min-zoom="0.1"
      :max-zoom="2"
      :snap-to-grid="true"
      :snap-grid="[10, 10]"
      @connect="onConnect"
      @node-drag-stop="onDragStop"
    >
      <Background pattern-color="var(--slb-color-gray-300)" :gap="20" />
      <Controls :show-interactive="false" />
      <MiniMap pannable zoomable />

      <template #[`node-${NODE_TYPE}`]="node">
        <WorkflowNodeCard
          :id="node.id"
          :data="node.data as CanvasNodeData"
          :selected="node.selected"
          @open="emit('open', $event)"
          @remove="session.remove([$event])"
          @toggle-disabled="session.update($event, 'disabled', !session.document.requireNode($event).disabled)"
        />
      </template>

      <template #[`edge-${EDGE_TYPE}`]="edge">
        <WorkflowEdge v-bind="edge" @remove="session.remove([], [$event])" />
      </template>
    </VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
</style>

<style scoped lang="scss">
.wf-canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
