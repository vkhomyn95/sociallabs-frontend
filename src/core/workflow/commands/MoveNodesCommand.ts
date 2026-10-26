import { toPositionsRecord, type DraftOp } from '@/core/sync/ops'
import type { NodeId, Position } from '../model'
import type { WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

/** Move nodes to new positions; one drag of any number of nodes is one command. */
export class MoveNodesCommand implements Command {
  readonly label: string
  private previous = new Map<NodeId, Position>()

  constructor(private readonly positions: ReadonlyMap<NodeId, Position>) {
    this.label = positions.size === 1 ? 'Move node' : `Move ${positions.size} nodes`
  }

  apply(doc: WorkflowDocument): void {
    this.positions.forEach((_, id) => doc.requireNode(id))
    this.previous = doc.moveNodes(this.positions)
  }

  revert(doc: WorkflowDocument): void {
    doc.moveNodes(this.previous)
  }

  toOps(): DraftOp[] {
    return [{ op: 'moveNodes', positions: toPositionsRecord(this.positions) }]
  }

  toRevertOps(): DraftOp[] {
    return [{ op: 'moveNodes', positions: toPositionsRecord(this.previous) }]
  }
}
