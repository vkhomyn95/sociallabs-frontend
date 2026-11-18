import { toConnectionDto, toNodeDto, type DraftOp } from '@/core/sync/ops'
import { connectionKey, type ConnectionModel, type NodeModel } from '../model'
import { DocumentError, type WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

/** Add nodes, optionally with connections among them or to existing nodes (paste, insert between). */
export class AddNodesCommand implements Command {
  readonly label: string

  constructor(
    private readonly nodes: readonly NodeModel[],
    private readonly connections: readonly ConnectionModel[] = [],
    label?: string,
  ) {
    this.label = label ?? AddNodesCommand.defaultLabel(nodes)
  }

  private static defaultLabel(nodes: readonly NodeModel[]): string {
    return nodes.length === 1 ? `Add ${nodes[0]!.name}` : `Add ${nodes.length} nodes`
  }

  apply(doc: WorkflowDocument): void {
    const duplicate = this.nodes.find((node) => doc.node(node.id))
    if (duplicate) throw new DocumentError(`Node ${duplicate.id} already exists`)
    this.nodes.forEach((node) => doc.insertNode(node))
    try {
      this.connections.forEach((connection) => doc.insertConnection(connection))
    } catch (error) {
      this.revert(doc)
      throw error
    }
  }

  revert(doc: WorkflowDocument): void {
    this.connections.forEach((connection) => {
      const key = connectionKey(connection)
      if (doc.connection(key)) doc.removeConnection(key)
    })
    this.nodes.forEach((node) => {
      if (doc.node(node.id)) doc.removeNode(node.id)
    })
  }

  toOps(): DraftOp[] {
    return [
      ...this.nodes.map((node): DraftOp => ({ op: 'addNode', node: toNodeDto(node) })),
      ...this.connections.map((connection): DraftOp => ({ op: 'addConnection', connection: toConnectionDto(connection) })),
    ]
  }

  toRevertOps(): DraftOp[] {
    return [{ op: 'removeNodes', nodeIds: this.nodes.map((node) => node.id) }]
  }
}
