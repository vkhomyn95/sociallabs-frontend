import { ConnectionIndex } from './ConnectionIndex'
import { connectionKey, type ConnectionModel, type EditableNodeField, type NodeId, type NodeModel, type Position } from './model'
import { TypedEmitter } from './TypedEmitter'

/** Complete graph, as loaded from and saved to the server. */
export interface WorkflowSnapshot {
  readonly nodes: readonly NodeModel[]
  readonly connections: readonly ConnectionModel[]
}

export type NodeChanges = Partial<Pick<NodeModel, EditableNodeField | 'position'>>

/** Fine-grained change events; the canvas and other views update only what an event names. */
export interface DocumentEvents {
  loaded: [snapshot: WorkflowSnapshot]
  nodeAdded: [node: NodeModel]
  nodeRemoved: [node: NodeModel]
  nodeChanged: [node: NodeModel, previous: NodeModel]
  connectionAdded: [connection: ConnectionModel, key: string]
  connectionRemoved: [connection: ConnectionModel, key: string]
}

/** Thrown when a change does not fit the document, e.g. a connection to a missing node. */
export class DocumentError extends Error {}

/**
 * Workflow graph kept outside Vue reactivity. The editor changes it through commands only, which keeps
 * undo/redo and the server operations in one place; views subscribe to {@link events}.
 */
export class WorkflowDocument {
  readonly events = new TypedEmitter<DocumentEvents>()
  private readonly nodeMap = new Map<NodeId, NodeModel>()
  private readonly connectionIndex = new ConnectionIndex()

  constructor(snapshot?: WorkflowSnapshot) {
    if (snapshot) this.fill(snapshot)
  }

  get nodeCount(): number {
    return this.nodeMap.size
  }

  node(id: NodeId): NodeModel | undefined {
    return this.nodeMap.get(id)
  }

  /** @throws DocumentError when there is no such node */
  requireNode(id: NodeId): NodeModel {
    const node = this.nodeMap.get(id)
    if (!node) throw new DocumentError(`No node ${id}`)
    return node
  }

  /** @returns nodes in declaration order */
  nodes(): NodeModel[] {
    return [...this.nodeMap.values()]
  }

  connections(): ConnectionModel[] {
    return [...this.connectionIndex.all()]
  }

  connection(key: string): ConnectionModel | undefined {
    return this.connectionIndex.get(key)
  }

  hasConnection(connection: Omit<ConnectionModel, 'type'>): boolean {
    return this.connectionIndex.has(connectionKey(connection))
  }

  incoming(id: NodeId): ConnectionModel[] {
    return this.connectionIndex.incoming(id)
  }

  outgoing(id: NodeId): ConnectionModel[] {
    return this.connectionIndex.outgoing(id)
  }

  touching(id: NodeId): ConnectionModel[] {
    return this.connectionIndex.touching(id)
  }

  snapshot(): WorkflowSnapshot {
    return { nodes: this.nodes(), connections: this.connections() }
  }

  /** Replace the whole graph, e.g. after a reload; not undoable. */
  load(snapshot: WorkflowSnapshot): void {
    this.nodeMap.clear()
    this.connectionIndex.clear()
    this.fill(snapshot)
    this.events.emit('loaded', this.snapshot())
  }

  // ─── Mutations: called by commands only ─────────────────────────────────────

  insertNode(node: NodeModel): void {
    if (this.nodeMap.has(node.id)) throw new DocumentError(`Node ${node.id} already exists`)
    this.nodeMap.set(node.id, node)
    this.events.emit('nodeAdded', node)
  }

  /** Remove a node together with its connections. @returns removed node and connections */
  removeNode(id: NodeId): { node: NodeModel; connections: ConnectionModel[] } {
    const node = this.requireNode(id)
    const connections = this.connectionIndex.touching(id)
    connections.forEach((connection) => this.removeConnection(connectionKey(connection)))
    this.nodeMap.delete(id)
    this.events.emit('nodeRemoved', node)
    return { node, connections }
  }

  /** @returns node before the change */
  updateNode(id: NodeId, changes: NodeChanges): NodeModel {
    const previous = this.requireNode(id)
    const node: NodeModel = { ...previous, ...changes }
    this.nodeMap.set(id, node)
    this.events.emit('nodeChanged', node, previous)
    return previous
  }

  insertConnection(connection: ConnectionModel): string {
    this.requireNode(connection.source)
    this.requireNode(connection.target)
    const key = connectionKey(connection)
    if (this.connectionIndex.has(key)) throw new DocumentError(`Connection ${key} already exists`)
    this.connectionIndex.add(connection)
    this.events.emit('connectionAdded', connection, key)
    return key
  }

  removeConnection(key: string): ConnectionModel {
    const connection = this.connectionIndex.remove(key)
    if (!connection) throw new DocumentError(`No connection ${key}`)
    this.events.emit('connectionRemoved', connection, key)
    return connection
  }

  /** @returns positions before the move */
  moveNodes(positions: ReadonlyMap<NodeId, Position>): Map<NodeId, Position> {
    const previous = new Map<NodeId, Position>()
    positions.forEach((position, id) => previous.set(id, this.updateNode(id, { position }).position))
    return previous
  }

  private fill(snapshot: WorkflowSnapshot): void {
    snapshot.nodes.forEach((node) => this.nodeMap.set(node.id, node))
    snapshot.connections.forEach((connection) => this.connectionIndex.add(connection))
  }
}
