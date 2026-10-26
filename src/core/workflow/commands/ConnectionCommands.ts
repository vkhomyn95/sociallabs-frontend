import { toConnectionDto, type DraftOp } from '@/core/sync/ops'
import { connectionKey, type ConnectionModel } from '../model'
import { DocumentError, type WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

const addOps = (connections: readonly ConnectionModel[]): DraftOp[] =>
  connections.map((connection) => ({ op: 'addConnection', connection: toConnectionDto(connection) }))

const removeOps = (connections: readonly ConnectionModel[]): DraftOp[] =>
  connections.map((connection) => ({ op: 'removeConnection', connection: toConnectionDto(connection) }))

/** Connect an output port to an input port. */
export class ConnectCommand implements Command {
  readonly label = 'Connect nodes'

  constructor(private readonly connection: ConnectionModel) {}

  apply(doc: WorkflowDocument): void {
    doc.insertConnection(this.connection)
  }

  revert(doc: WorkflowDocument): void {
    doc.removeConnection(connectionKey(this.connection))
  }

  toOps(): DraftOp[] {
    return addOps([this.connection])
  }

  toRevertOps(): DraftOp[] {
    return removeOps([this.connection])
  }
}

/** Remove connections by key. */
export class DisconnectCommand implements Command {
  readonly label: string
  private removed: ConnectionModel[] = []

  constructor(private readonly keys: readonly string[]) {
    this.label = keys.length === 1 ? 'Remove connection' : `Remove ${keys.length} connections`
  }

  apply(doc: WorkflowDocument): void {
    this.keys.forEach((key) => {
      if (!doc.connection(key)) throw new DocumentError(`No connection ${key}`)
    })
    this.removed = this.keys.map((key) => doc.removeConnection(key))
  }

  revert(doc: WorkflowDocument): void {
    this.removed.forEach((connection) => doc.insertConnection(connection))
  }

  toOps(): DraftOp[] {
    return removeOps(this.removed)
  }

  toRevertOps(): DraftOp[] {
    return addOps(this.removed)
  }
}
