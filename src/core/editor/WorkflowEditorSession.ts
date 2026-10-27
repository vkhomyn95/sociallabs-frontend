import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { defaultParameters } from '@/core/node-types/parameters'
import type { DraftApi } from '@/core/sync/DraftApi'
import { DraftSync, type DraftSyncOptions } from '@/core/sync/DraftSync'
import {
  AddNodesCommand,
  CommandHistory,
  CompositeCommand,
  ConnectCommand,
  DisconnectCommand,
  MoveNodesCommand,
  RemoveNodesCommand,
  UpdateNodeCommand,
  type Command,
} from '@/core/workflow/commands'
import type { HistoryOptions } from '@/core/workflow/commands/CommandHistory'
import { uniqueNodeName, wouldCreateCycle } from '@/core/workflow/graph'
import {
  ConnectionType,
  type ConnectionModel,
  type EditableNodeField,
  type NodeId,
  type NodeModel,
  type Parameters,
  type Position,
} from '@/core/workflow/model'
import { WorkflowDocument, type WorkflowSnapshot } from '@/core/workflow/WorkflowDocument'

export interface SessionOptions {
  history?: HistoryOptions
  sync?: DraftSyncOptions
  newId?: () => NodeId
}

/** Which way a new node is wired to the node it was added from. */
export enum LinkDirection {
  /** The existing node's output feeds the new node's first input (added after it). */
  FROM_EXISTING = 'FROM_EXISTING',
  /** The new node's first output goes into the existing node's input (added before it, or a sub-node). */
  INTO_EXISTING = 'INTO_EXISTING',
}

/** A connection made together with a new node, in the same undo step. */
export interface InsertLink {
  readonly node: NodeId
  /** Output of the existing node for FROM_EXISTING, its input for INTO_EXISTING. */
  readonly port: number
  readonly direction: LinkDirection
  readonly type: ConnectionType
}

export interface InsertOptions {
  /** Values over the type's defaults, e.g. the operation an action of the node creator stands for. */
  readonly parameters?: Parameters
  readonly link?: InsertLink
}

/** Why a connection was not made. */
export enum ConnectRejection {
  SAME_NODE = 'SAME_NODE',
  DUPLICATE = 'DUPLICATE',
  CYCLE = 'CYCLE',
  /** A sub-node output into a main input, or between different sub-node kinds. */
  PORT_KIND = 'PORT_KIND',
  /** Not from an output into an input the nodes have, e.g. into a trigger, which has no input. */
  NO_PORT = 'NO_PORT',
}

/**
 * One open workflow in the editor: the document, its undo history and the draft sync, wired so that every
 * executed, undone or redone command is saved as draft operations. Framework-free; Vue adapts it in
 * features/workflow-editor.
 */
export class WorkflowEditorSession {
  readonly document: WorkflowDocument
  readonly history: CommandHistory
  readonly sync: DraftSync
  private readonly newId: () => NodeId
  private readonly unsubscribe: () => void

  constructor(api: DraftApi, readonly workflowId: number, revision: number, snapshot: WorkflowSnapshot, options: SessionOptions = {}) {
    this.document = new WorkflowDocument(snapshot)
    this.history = new CommandHistory(this.document, options.history)
    this.sync = new DraftSync(api, workflowId, revision, options.sync)
    this.newId = options.newId ?? (() => crypto.randomUUID())
    this.unsubscribe = this.history.events.on('applied', (ops) => this.sync.enqueue(ops))
  }

  execute(command: Command): void {
    this.history.execute(command)
  }

  undo(): boolean {
    return this.history.undo()
  }

  redo(): boolean {
    return this.history.redo()
  }

  /**
   * Add a node of a type, optionally with preset parameters and wired to an existing node, as one undo step.
   *
   * @returns the new node
   */
  insertNode(type: NodeTypeDescriptor, position: Position, options: InsertOptions = {}): NodeModel {
    const node: NodeModel = {
      id: this.newId(),
      name: uniqueNodeName(this.document, type.displayName),
      type: type.name,
      typeVersion: type.version,
      position,
      parameters: { ...defaultParameters(type.properties), ...options.parameters },
      credentialId: null,
      disabled: false,
      notes: null,
      settings: null,
    }
    const add = new AddNodesCommand([node])
    const link = options.link
    if (!link || !this.document.node(link.node)) {
      this.execute(add)
      return node
    }
    // A brand-new node closes no cycle and duplicates no connection, so the link needs no checks.
    const connection: ConnectionModel =
      link.direction === LinkDirection.FROM_EXISTING
        ? { source: link.node, sourceOutput: link.port, target: node.id, targetInput: 0, type: link.type }
        : { source: node.id, sourceOutput: 0, target: link.node, targetInput: link.port, type: link.type }
    this.execute(new CompositeCommand(`Add ${node.name}`, [add, new ConnectCommand(connection)]))
    return node
  }

  /**
   * Connect two ports unless the connection is a duplicate or would close a cycle.
   *
   * @returns null when connected, otherwise the reason it was not
   */
  connect(connection: Omit<ConnectionModel, 'type'> & { type?: ConnectionType }): ConnectRejection | null {
    const model: ConnectionModel = { ...connection, type: connection.type ?? ConnectionType.MAIN }
    if (model.source === model.target) return ConnectRejection.SAME_NODE
    if (this.document.hasConnection(model)) return ConnectRejection.DUPLICATE
    if (model.type === ConnectionType.MAIN && wouldCreateCycle(this.document, model)) return ConnectRejection.CYCLE
    this.execute(new ConnectCommand(model))
    return null
  }

  /** Delete nodes and connections in one undo step; connections of deleted nodes go with them. */
  remove(nodeIds: readonly NodeId[], connectionKeys: readonly string[] = []): void {
    const removedNodes = new Set(nodeIds)
    const keys = connectionKeys.filter((key) => {
      const connection = this.document.connection(key)
      return connection && !removedNodes.has(connection.source) && !removedNodes.has(connection.target)
    })
    const commands: Command[] = []
    if (keys.length) commands.push(new DisconnectCommand(keys))
    if (nodeIds.length) commands.push(new RemoveNodesCommand(nodeIds))
    if (commands.length === 1) this.execute(commands[0]!)
    else if (commands.length) this.execute(new CompositeCommand('Delete selection', commands))
  }

  /** Record where nodes were dropped after a drag; unchanged positions are ignored. */
  move(positions: ReadonlyMap<NodeId, Position>): void {
    const moved = new Map(
      [...positions].filter(([id, position]) => {
        const current = this.document.node(id)?.position
        return current && (Math.round(current.x) !== Math.round(position.x) || Math.round(current.y) !== Math.round(position.y))
      }),
    )
    if (moved.size) this.execute(new MoveNodesCommand(moved))
  }

  /** Set one field of a node; setting the current value does nothing. */
  update<K extends EditableNodeField>(nodeId: NodeId, field: K, value: NodeModel[K]): void {
    if (Object.is(this.document.requireNode(nodeId)[field], value)) return
    this.execute(new UpdateNodeCommand(nodeId, field, value))
  }

  /**
   * Apply several field changes of one node (e.g. from a node editor dialog) as one undo step.
   * Fields are compared by value, so an unchanged copy of parameters is not saved.
   */
  patch(nodeId: NodeId, changes: Partial<Pick<NodeModel, EditableNodeField>>): void {
    const current = this.document.requireNode(nodeId)
    const commands = (Object.keys(changes) as EditableNodeField[])
      .filter((field) => !sameValue(current[field], changes[field]))
      .map((field) => new UpdateNodeCommand(nodeId, field, changes[field] as never))
    if (commands.length === 1) this.execute(commands[0]!)
    else if (commands.length) this.execute(new CompositeCommand('Edit node', commands))
  }

  /** Continue from a freshly loaded draft; unsaved changes and the undo history are dropped. */
  reload(snapshot: WorkflowSnapshot, revision: number): void {
    this.document.load(snapshot)
    this.history.clear()
    this.sync.reset(revision)
  }

  dispose(): void {
    this.unsubscribe()
    this.sync.dispose()
  }
}

/** Structural equality of JSON-like values. */
function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  return (
    keysA.length === keysB.length &&
    keysA.every((key) => sameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  )
}
