<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { ConnectionMode, VueFlow, useVueFlow, type Connection, type HandleType, type NodeDragEvent, type OnConnectStartParams } from '@vue-flow/core'
import { SlbButton } from '@sociallabs/frontend-components'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { ConnectRejection } from '@/core/editor/WorkflowEditorSession'
import type { WorkflowView } from '@/core/editor/WorkflowView'
import type { ExecutionTracker } from '@/core/execution/ExecutionTracker'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import type { NodeId, Position } from '@/core/workflow/model'
import { CanvasModelFactory, EDGE_TYPE, handleIndex, isOutputHandle, NODE_SIZE, NODE_TYPE, type CanvasNodeData } from './canvasModel'
import { checkConnection } from './connectionRules'
import { CanvasProjection, type CanvasPort } from './CanvasProjection'
import WorkflowNodeCard from './nodes/WorkflowNodeCard.vue'
import WorkflowEdge from './edges/WorkflowEdge.vue'
import WorkflowConnectionLine from './edges/WorkflowConnectionLine.vue'
import { InsertMode, type InsertTarget } from '../creator/insertTarget'
import { carriesNode, readNodeDrag } from '../creator/dragPayload'
import { insertTargetFor } from './insertPlacement'

/**
 * Vue Flow adapter: renders the view's document through a projection and turns gestures into commands.
 * Asking for a new node (the add button, a port's plus, a connection dropped on the empty canvas) is emitted as
 * an insert target for the node creator. A read-only view (no commands) can be panned, zoomed and opened, but not changed.
 */
const props = defineProps<{
  view: WorkflowView
  catalog: NodeTypeCatalog
  tracker: ExecutionTracker
}>()

const emit = defineEmits<{
  open: [nodeId: NodeId]
  rejected: [reason: ConnectRejection]
  /** A node should be added there: open the node creator. */
  create: [target: InsertTarget]
  /** A node was dropped from the node creator. */
  dropped: [nodeId: NodeId]
  paneClick: []
}>()

const flowId = `workflow-${props.view.workflowId}`
const commands = props.view.commands
const readonly = commands === null
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
  projection = new CanvasProjection(props.view.document, new CanvasModelFactory(props.catalog), canvasPort, props.tracker)
  projection.render()
})

onBeforeUnmount(() => projection?.dispose())

const dataOf = (id: NodeId): CanvasNodeData | undefined => projection?.dataOf(id)

/** Lets Vue Flow snap only to inputs a drag may end on. */
const isValidConnection = (connection: Connection): boolean => !readonly && checkConnection(connection, dataOf).valid

function onConnect(connection: Connection): void {
  if (drag) drag.connected = true
  if (!commands) return
  const check = checkConnection(connection, dataOf)
  if (!check.valid) {
    emit('rejected', check.rejection)
    return
  }
  const { sourceOutput, targetInput, type } = check
  const rejection = commands.connect({ source: connection.source, sourceOutput, target: connection.target, targetInput, type })
  if (rejection) emit('rejected', rejection)
}

// ─── Adding nodes ────────────────────────────────────────────────────

/** A drag shorter than this is a click on the port, not a connection dropped somewhere. */
const DROP_DISTANCE = 8

/** @returns where a node added from a port of a drawn node goes, null when nothing can be added there */
function targetFor(nodeId: NodeId, handleId: string, drop: Position | null): InsertTarget | null {
  const data = dataOf(nodeId)
  const node = flow.findNode(nodeId)
  if (!data || !node) return null
  const side = isOutputHandle(handleId) ? 'output' : 'input'
  const port = (side === 'output' ? data.outputs : data.inputs).find((p) => p.index === handleIndex(handleId))
  if (!port) return null
  const box = { ...node.computedPosition, ...node.dimensions }
  return insertTargetFor({ node: nodeId, box, port, side }, drop)
}

function requestInsert(nodeId: NodeId, handleId: string, drop: Position | null = null): void {
  const target = commands && targetFor(nodeId, handleId, drop)
  if (target) emit('create', target)
}

interface ConnectionDrag {
  nodeId: string
  handleId: string
  handleType: HandleType
  from: { x: number; y: number }
  connected: boolean
}

let drag: ConnectionDrag | null = null

const pointOf = (event?: MouseEvent | TouchEvent): { x: number; y: number } | null => {
  if (!event) return null
  const point = 'changedTouches' in event ? event.changedTouches[0] : event
  return point ? { x: point.clientX, y: point.clientY } : null
}

function onConnectStart(params: OnConnectStartParams & { event?: MouseEvent | TouchEvent }): void {
  const from = pointOf(params.event)
  drag = params.nodeId && params.handleId && params.handleType && from
    ? { nodeId: params.nodeId, handleId: params.handleId, handleType: params.handleType, from, connected: false }
    : null
}

/** A connection dropped on the empty canvas asks for a new node there, like n8n. */
function onConnectEnd(event?: MouseEvent | TouchEvent): void {
  const ended = drag
  drag = null
  const to = pointOf(event)
  if (!ended || ended.connected || !to) return
  if (Math.hypot(to.x - ended.from.x, to.y - ended.from.y) < DROP_DISTANCE) return
  requestInsert(ended.nodeId, ended.handleId, flow.screenToFlowCoordinate(to))
}

function onDragStop(event: NodeDragEvent): void {
  commands?.move(new Map(event.nodes.map((node) => [node.id, { ...node.position }])))
}

function onDrop(event: DragEvent): void {
  const payload = readNodeDrag(event)
  const type = payload ? props.catalog.get(payload.key) : undefined
  if (!payload || !type || !commands) return
  const point: Position = flow.screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  const node = commands.insertNode(type, { x: point.x - NODE_SIZE / 2, y: point.y - NODE_SIZE / 2 }, { parameters: payload.parameters })
  emit('dropped', node.id)
}

function onDragOver(event: DragEvent): void {
  if (commands && carriesNode(event) && event.dataTransfer) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }
}

/** Delete the selected nodes and connections as one undo step. */
function deleteSelection(): void {
  commands?.remove(
    flow.getSelectedNodes.value.map((node) => node.id),
    flow.getSelectedEdges.value.map((edge) => edge.id),
  )
}

/** @returns centre of the visible area in flow coordinates, where nodes added without a port go */
function viewportCentre(): Position {
  const { x, y, zoom } = flow.viewport.value
  const { width, height } = flow.dimensions.value
  return { x: (width / 2 - x) / zoom - NODE_SIZE / 2, y: (height / 2 - y) / zoom - NODE_SIZE / 2 }
}

/** Ask for a node that is not wired to anything, e.g. from the add button or the Tab key. */
function requestFreeInsert(): void {
  if (commands) emit('create', { mode: InsertMode.FREE, position: viewportCentre() })
}

defineExpose({ deleteSelection, requestFreeInsert })
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
      :nodes-draggable="!readonly"
      :nodes-connectable="!readonly"
      :connection-mode="ConnectionMode.Strict"
      :is-valid-connection="isValidConnection"
      :edges-updatable="false"
      :connect-on-click="false"
      @connect="onConnect"
      @connect-start="onConnectStart"
      @connect-end="onConnectEnd"
      @node-drag-stop="onDragStop"
      @pane-click="emit('paneClick')"
    >
      <Background pattern-color="var(--slb-color-gray-300)" :gap="20" />
      <Controls :show-interactive="false" />
      <MiniMap pannable zoomable />

      <template #[`node-${NODE_TYPE}`]="node">
        <WorkflowNodeCard
          :id="node.id"
          :data="node.data as CanvasNodeData"
          :selected="node.selected"
          :readonly="readonly"
          @open="emit('open', $event)"
          @remove="commands?.remove([$event])"
          @toggle-disabled="commands?.update($event, 'disabled', !view.document.requireNode($event).disabled)"
          @plus="requestInsert"
        />
      </template>

      <template #connection-line="line">
        <WorkflowConnectionLine v-bind="line" />
      </template>

      <template #[`edge-${EDGE_TYPE}`]="edge">
        <WorkflowEdge v-bind="edge" :readonly="readonly" @remove="commands?.remove([], [$event])" />
      </template>
    </VueFlow>

    <SlbButton
      v-if="!readonly"
      class="wf-canvas__add"
      variant="secondary"
      icon-only
      icon-left="action_plus"
      title="Add a node (Tab)"
      aria-label="Add a node"
      @click="requestFreeInsert"
    />
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

.wf-canvas__add {
  position: absolute;
  top: 28px;
  right: 16px;
  z-index: 5;
  box-shadow: var(--slb-shadow-sm);
}
</style>
