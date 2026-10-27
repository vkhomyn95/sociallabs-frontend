import type { ExecutionTracker, NodeRunView } from '@/core/execution/ExecutionTracker'
import type { ConnectionModel, NodeId, NodeModel } from '@/core/workflow/model'
import type { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import type { CanvasEdge, CanvasEdgeData, CanvasModelFactory, CanvasNode, CanvasNodeData, EdgeEnds } from './canvasModel'

/** Canvas operations the projection needs; implemented by the Vue Flow store. */
export interface CanvasPort {
  setNodes(nodes: CanvasNode[]): void
  setEdges(edges: CanvasEdge[]): void
  addNodes(nodes: CanvasNode[]): void
  removeNodes(ids: string[]): void
  updateNode(id: string, update: Partial<CanvasNode>): void
  addEdges(edges: CanvasEdge[]): void
  removeEdges(ids: string[]): void
  updateEdgeData(id: string, data: CanvasEdgeData): void
}

/**
 * Keeps the canvas in step with the document by translating each document event into the matching
 * point update, so a change of one node re-renders one card instead of rebuilding every node and edge.
 */
export class CanvasProjection {
  private readonly data = new Map<NodeId, CanvasNodeData>()
  private readonly unsubscribe: Array<() => void>

  constructor(
    private readonly doc: WorkflowDocument,
    private readonly factory: CanvasModelFactory,
    private readonly canvas: CanvasPort,
    private readonly tracker?: ExecutionTracker,
  ) {
    const events = doc.events
    this.unsubscribe = [
      ...(tracker ? [tracker.events.on('node', (id, view) => this.onRunChanged(id, view))] : []),
      events.on('loaded', () => this.render()),
      events.on('nodeAdded', (node) => this.canvas.addNodes([this.toCanvasNode(node)])),
      events.on('nodeRemoved', (node) => {
        this.data.delete(node.id)
        this.canvas.removeNodes([node.id])
      }),
      events.on('nodeChanged', (node, previous) => this.onNodeChanged(node, previous)),
      events.on('connectionAdded', (connection) => this.canvas.addEdges([this.factory.edge(connection, this.endsOf(connection))])),
      events.on('connectionRemoved', (_, key) => this.canvas.removeEdges([key])),
    ]
  }

  /** Draw the whole document; used once on open and after a reload. */
  render(): void {
    this.data.clear()
    const nodes = this.doc.nodes().map((node) => this.toCanvasNode(node))
    this.canvas.setNodes(nodes)
    this.canvas.setEdges(this.doc.connections().map((c) => this.factory.edge(c, this.endsOf(c))))
  }

  dataOf(id: NodeId): CanvasNodeData | undefined {
    return this.data.get(id)
  }

  dispose(): void {
    this.unsubscribe.forEach((off) => off())
  }

  private endsOf(connection: ConnectionModel): EdgeEnds {
    return { source: this.data.get(connection.source), target: this.data.get(connection.target) }
  }

  private runOf(id: NodeId): NodeRunView | null {
    return this.tracker?.view(id) ?? null
  }

  private onRunChanged(id: NodeId, run: NodeRunView | null): void {
    const current = this.data.get(id)
    if (!current || current.run === run) return
    const data = this.factory.withRun(current, run)
    this.data.set(id, data)
    this.canvas.updateNode(id, { data })
  }

  private toCanvasNode(node: NodeModel): CanvasNode {
    const canvasNode = this.factory.node(node, this.runOf(node.id))
    this.data.set(node.id, canvasNode.data)
    return canvasNode
  }

  private onNodeChanged(node: NodeModel, previous: NodeModel): void {
    const onlyMoved = Object.keys(node).every(
      (key) => key === 'position' || node[key as keyof NodeModel] === previous[key as keyof NodeModel],
    )
    if (onlyMoved) {
      this.canvas.updateNode(node.id, { position: { ...node.position } })
      return
    }
    const oldData = this.data.get(node.id)
    const data = this.factory.nodeData(node, this.runOf(node.id))
    this.data.set(node.id, data)
    this.canvas.updateNode(node.id, { data, position: { ...node.position } })
    if (oldData && !samePorts(oldData, data)) {
      // Port labels and colors follow the node (e.g. Switch rules), and a removed port breaks its edges.
      this.doc.touching(node.id).forEach((connection) => {
        const edge = this.factory.edge(connection, this.endsOf(connection))
        this.canvas.updateEdgeData(edge.id, edge.data)
      })
    }
  }
}

const samePorts = (a: CanvasNodeData, b: CanvasNodeData): boolean =>
  a.inputs.length === b.inputs.length &&
  a.outputs.length === b.outputs.length &&
  a.outputs.every((port, i) => port.label === b.outputs[i]!.label && port.role === b.outputs[i]!.role)
