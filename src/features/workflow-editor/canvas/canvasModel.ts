import { markRaw } from 'vue'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { inputPorts, outputPorts, PortRole, type PortView } from '@/core/node-types/ports'
import { NodeKind, PortKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { connectionKey, typeKeyOf, type ConnectionModel, type NodeModel, type Position } from '@/core/workflow/model'
import { presentationOf, type NodePresentation } from '../presentation'

export const NODE_TYPE = 'workflow'
export const EDGE_TYPE = 'workflow'

/** Everything a node card renders; replaced as a whole when the node changes, never mutated. */
export interface CanvasNodeData {
  readonly node: NodeModel
  readonly descriptor: NodeTypeDescriptor | undefined
  readonly presentation: NodePresentation
  readonly inputs: readonly PortView[]
  readonly outputs: readonly PortView[]
  readonly trigger: boolean
}

export interface CanvasEdgeData {
  readonly label: string
  readonly color: string
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

/** Builds canvas nodes and edges from document models and node type descriptors. */
export class CanvasModelFactory {
  constructor(private readonly catalog: NodeTypeCatalog) {}

  node(node: NodeModel): CanvasNode {
    return { id: node.id, type: NODE_TYPE, position: { ...node.position }, data: this.nodeData(node) }
  }

  nodeData(node: NodeModel): CanvasNodeData {
    const descriptor = this.catalog.get(typeKeyOf(node))
    return markRaw({
      node,
      descriptor,
      presentation: presentationOf(node.type, descriptor),
      // A type missing from the catalog keeps one main port each way, so its connections stay visible.
      inputs: descriptor ? inputPorts(descriptor) : [FALLBACK_PORT],
      outputs: descriptor ? outputPorts(descriptor, node) : [FALLBACK_PORT],
      trigger: descriptor?.kind === NodeKind.TRIGGER,
    })
  }

  edge(connection: ConnectionModel, sourceData: CanvasNodeData | undefined): CanvasEdge {
    return {
      id: connectionKey(connection),
      type: EDGE_TYPE,
      source: connection.source,
      target: connection.target,
      sourceHandle: outputHandle(connection.sourceOutput),
      targetHandle: inputHandle(connection.targetInput),
      data: this.edgeData(connection, sourceData),
    }
  }

  edgeData(connection: ConnectionModel, sourceData: CanvasNodeData | undefined): CanvasEdgeData {
    const outputs = sourceData?.outputs ?? []
    const port = outputs.find((p) => p.index === connection.sourceOutput)
    if (!port || outputs.length < 2) return { label: port?.label ?? '', color: NEUTRAL }
    const color =
      port.role === PortRole.ERROR ? ERROR : port.role === PortRole.FALLBACK ? NEUTRAL : PORT_COLORS[port.index % PORT_COLORS.length]!
    return { label: port.label, color }
  }
}
