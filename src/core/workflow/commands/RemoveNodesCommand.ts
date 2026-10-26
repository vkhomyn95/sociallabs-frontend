import { toConnectionDto, toNodeDto, type DraftOp } from '@/core/sync/ops'
import { connectionKey, type ConnectionModel, type NodeId, type NodeModel } from '../model'
import type { WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

/** Remove nodes with their connections; undo restores both (restored nodes are appended, as on the server). */
export class RemoveNodesCommand implements Command {
  readonly label: string
  private removedNodes: NodeModel[] = []
  private removedConnections: ConnectionModel[] = []

  constructor(private readonly ids: readonly NodeId[]) {
    this.label = ids.length === 1 ? 'Delete node' : `Delete ${ids.length} nodes`
  }

  apply(doc: WorkflowDocument): void {
    this.ids.forEach((id) => doc.requireNode(id))
    const connections = new Map<string, ConnectionModel>()
    this.removedNodes = this.ids.map((id) => {
      const removed = doc.removeNode(id)
      removed.connections.forEach((connection) => connections.set(connectionKey(connection), connection))
      return removed.node
    })
    this.removedConnections = [...connections.values()]
  }

  revert(doc: WorkflowDocument): void {
    this.removedNodes.forEach((node) => doc.insertNode(node))
    this.removedConnections.forEach((connection) => doc.insertConnection(connection))
  }

  toOps(): DraftOp[] {
    return [{ op: 'removeNodes', nodeIds: [...this.ids] }]
  }

  toRevertOps(): DraftOp[] {
    return [
      ...this.removedNodes.map((node): DraftOp => ({ op: 'addNode', node: toNodeDto(node) })),
      ...this.removedConnections.map((connection): DraftOp => ({ op: 'addConnection', connection: toConnectionDto(connection) })),
    ]
  }
}
