import { NODE_FIELD_OPS, type DraftOp } from '@/core/sync/ops'
import type { EditableNodeField, NodeId, NodeModel } from '../model'
import type { WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

const LABELS: Record<EditableNodeField, string> = {
  name: 'Rename node',
  parameters: 'Edit parameters',
  credentialId: 'Change credential',
  disabled: 'Toggle node',
  notes: 'Edit notes',
  settings: 'Edit settings',
}

const fieldOp = <K extends EditableNodeField>(field: K) =>
  NODE_FIELD_OPS[field] as (nodeId: NodeId, value: NodeModel[K]) => DraftOp

/**
 * Set one field of a node. Consecutive updates of the same field of the same node merge into one undo step.
 *
 * @typeParam K edited field
 */
export class UpdateNodeCommand<K extends EditableNodeField> implements Command {
  readonly label: string
  private previous: NodeModel[K] | undefined

  constructor(
    readonly nodeId: NodeId,
    readonly field: K,
    private readonly value: NodeModel[K],
    initialPrevious?: NodeModel[K],
  ) {
    this.label = LABELS[field]
    this.previous = initialPrevious
  }

  apply(doc: WorkflowDocument): void {
    const previous = doc.updateNode(this.nodeId, { [this.field]: this.value } as Pick<NodeModel, K>)
    // A merged command keeps the value from before the first of the merged edits.
    if (this.previous === undefined) this.previous = previous[this.field]
  }

  revert(doc: WorkflowDocument): void {
    doc.updateNode(this.nodeId, { [this.field]: this.previous } as Pick<NodeModel, K>)
  }

  toOps(): DraftOp[] {
    return [fieldOp(this.field)(this.nodeId, this.value)]
  }

  toRevertOps(): DraftOp[] {
    return [fieldOp(this.field)(this.nodeId, this.previous as NodeModel[K])]
  }

  mergeWith(previous: Command): Command | null {
    if (!(previous instanceof UpdateNodeCommand) || previous.nodeId !== this.nodeId || previous.field !== this.field) {
      return null
    }
    return new UpdateNodeCommand<K>(this.nodeId, this.field, this.value, previous.previous as NodeModel[K])
  }
}
