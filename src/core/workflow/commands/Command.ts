import type { DraftOp } from '@/core/sync/ops'
import type { WorkflowDocument } from '../WorkflowDocument'

/**
 * Reversible change of the document; the only way the editor mutates the graph.
 * State a command needs to revert (removed nodes, old values) is captured in {@link apply}.
 */
export interface Command {
  readonly label: string
  /** @throws DocumentError when the change does not fit the document; the document is left unchanged */
  apply(doc: WorkflowDocument): void
  revert(doc: WorkflowDocument): void
  /** Server operations equivalent to the last {@link apply}. */
  toOps(): DraftOp[]
  /** Server operations equivalent to {@link revert}. */
  toRevertOps(): DraftOp[]
  /**
   * Fold this command into the previous one so that, e.g., typing into one field is a single undo step.
   *
   * @param previous command applied right before this one
   * @returns command equivalent to both, or null when they do not merge
   */
  mergeWith?(previous: Command): Command | null
}

/** Several commands applied as one undo step. */
export class CompositeCommand implements Command {
  constructor(
    readonly label: string,
    private readonly commands: readonly Command[],
  ) {}

  get size(): number {
    return this.commands.length
  }

  apply(doc: WorkflowDocument): void {
    const applied: Command[] = []
    try {
      for (const command of this.commands) {
        command.apply(doc)
        applied.push(command)
      }
    } catch (error) {
      applied.reverse().forEach((command) => command.revert(doc))
      throw error
    }
  }

  revert(doc: WorkflowDocument): void {
    ;[...this.commands].reverse().forEach((command) => command.revert(doc))
  }

  toOps(): DraftOp[] {
    return this.commands.flatMap((command) => command.toOps())
  }

  toRevertOps(): DraftOp[] {
    return [...this.commands].reverse().flatMap((command) => command.toRevertOps())
  }
}
