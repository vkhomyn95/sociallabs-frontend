import { markRaw } from 'vue'
import type { GraphNode } from '@vue-flow/core'
import type { NodeRunView } from '@/core/execution/ExecutionTracker'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { inputPorts, outputPorts, PortRole, type PortView } from '@/core/node-types/ports'
import { NodeKind, PortKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { ConnectionType, connectionKey, typeKeyOf, type ConnectionModel, type NodeModel, type Position } from '@/core/workflow/model'
import { presentationOf, type NodePresentation } from '../presentation'

export const NODE_TYPE = 'workflow'
export const EDGE_TYPE = 'workflow'

/** Side of a regular node card; nodes with many ports grow taller, agents wider. */
export const NODE_SIZE = 100

/** Height below a card taken by its name and subtitle, which hang outside the box Vue Flow measures. */
export const NODE_LABEL_SPACE = 48

/** @returns lowest point a drawn node takes, its name and subtitle included */
export const floorOf = (node: Pick<GraphNode, 'computedPosition' | 'dimensions'>): number =>
  node.computedPosition.y + node.dimensions.height + NODE_LABEL_SPACE

/** Everything a node card renders; replaced as a whole when the node changes, never mutated. */
export interface CanvasNodeData {
  readonly node: NodeModel
  readonly descriptor: NodeTypeDescriptor | undefined
  readonly presentation: NodePresentation
  readonly inputs: readonly PortView[]
  readonly outputs: readonly PortView[]
  readonly trigger: boolean
  /** Sub-node (model, memory, tool): output on top, never runs. */
  readonly supply: boolean
  /** State in the execution the editor follows, null when the node did not run in it. */
  readonly run: NodeRunView | null
}

export interface CanvasEdgeData {
  readonly label: string
  readonly color: string
  /** Sub-node attachment rather than a data connection. */
  readonly subNode: boolean
  /** Joins ports the nodes do not have (e.g. into a trigger); drawn as an error so it can be removed. */
  readonly broken: boolean
}

/** The nodes an edge joins, as the canvas knows them; undefined while a node is missing. */
export interface EdgeEnds {
  readonly source: CanvasNodeData | undefined
  readonly target: CanvasNodeData | undefined
}

/** The subset of a Vue Flow node the projection produces. */
export interface CanvasNode {
  id: string
  type: typeof NODE_TYPE
  position: Position
  data: CanvasNodeData
}

export interface CanvasEdge {
  id: string
  type: typeof EDGE_TYPE
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  data: CanvasEdgeData
}

const FALLBACK_PORT: PortView = { index: 0, label: '', kind: PortKind.MAIN, role: PortRole.DEFAULT }

const PORT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1', '#ec4899', '#14b8a6']
const NEUTRAL = '#9ca3af'
const ERROR = '#dc2626'

/** Handle ids on the card; edges reference them. */
export const outputHandle = (index: number): string => `out-${index}`
export const inputHandle = (index: number): string => `in-${index}`
export const handleIndex = (handle: string | null | undefined): number => Number(handle?.split('-')[1] ?? 0)
export const isOutputHandle = (handle: string | null | undefined): boolean => handle?.startsWith('out-') ?? false
export const isInputHandle = (handle: string | null | undefined): boolean => handle?.startsWith('in-') ?? false

/** Builds canvas nodes and edges from document models and node type descriptors. */
export class CanvasModelFactory {
  constructor(private readonly catalog: NodeTypeCatalog) {}

  node(node: NodeModel, run: NodeRunView | null = null): CanvasNode {
    return { id: node.id, type: NODE_TYPE, position: { ...node.position }, data: this.nodeData(node, run) }
  }

  nodeData(node: NodeModel, run: NodeRunView | null = null): CanvasNodeData {
    const descriptor = this.catalog.get(typeKeyOf(node))
    return markRaw({
      node,
      descriptor,
      presentation: presentationOf(node.type, descriptor),
      // A type missing from the catalog keeps one main port each way, so its connections stay visible.
      inputs: descriptor ? inputPorts(descriptor, node) : [FALLBACK_PORT],
      outputs: descriptor ? outputPorts(descriptor, node) : [FALLBACK_PORT],
      trigger: descriptor?.kind === NodeKind.TRIGGER,
      supply: descriptor?.kind === NodeKind.SUPPLY,
      run,
    })
  }

  /** @returns the same node data with another run state */
  withRun(data: CanvasNodeData, run: NodeRunView | null): CanvasNodeData {
    return markRaw({ ...data, run })
  }

  edge(connection: ConnectionModel, ends: EdgeEnds): CanvasEdge {
    return {
      id: connectionKey(connection),
      type: EDGE_TYPE,
      source: connection.source,
      target: connection.target,
      sourceHandle: outputHandle(connection.sourceOutput),
      targetHandle: inputHandle(connection.targetInput),
      data: this.edgeData(connection, ends),
    }
  }

  edgeData(connection: ConnectionModel, ends: EdgeEnds): CanvasEdgeData {
    const subNode = connection.type !== ConnectionType.MAIN
    const outputs = ends.source?.outputs ?? []
    const port = outputs.find((p) => p.index === connection.sourceOutput)
    const targetPort = ends.target?.inputs.find((p) => p.index === connection.targetInput)
    // Nodes not drawn yet are not judged; a missing port of a drawn node is.
    if ((ends.source && !port) || (ends.target && !targetPort)) return { label: 'broken', color: ERROR, subNode, broken: true }
    if (subNode) return { label: '', color: NEUTRAL, subNode, broken: false }
    if (!port || outputs.length < 2) return { label: port?.label ?? '', color: NEUTRAL, subNode, broken: false }
    const color =
      port.role === PortRole.ERROR ? ERROR : port.role === PortRole.FALLBACK ? NEUTRAL : PORT_COLORS[port.index % PORT_COLORS.length]!
    return { label: port.label, color, subNode, broken: false }
  }
}
