import type { DraftOp } from '@/core/sync/ops'
import { TypedEmitter } from '../TypedEmitter'
import type { WorkflowDocument } from '../WorkflowDocument'
import type { Command } from './Command'

export interface HistoryEvents {
  /** Server operations of an execute, undo or redo, in order. */
  applied: [ops: DraftOp[]]
  /** Undo/redo availability or labels may have changed. */
  changed: []
}

export interface HistoryOptions {
  /** Maximum number of undo steps kept. */
  limit?: number
  /** Edits closer together than this merge into one undo step when the command supports it. */
  mergeWindowMs?: number
  clock?: () => number
}

/** Undo/redo stacks over a document; every change of the editor goes through {@link execute}. */
export class CommandHistory {
  readonly events = new TypedEmitter<HistoryEvents>()
  private readonly undoStack: Command[] = []
  private readonly redoStack: Command[] = []
  private readonly limit: number
  private readonly mergeWindowMs: number
  private readonly clock: () => number
  private lastExecutedAt = Number.NEGATIVE_INFINITY

  constructor(
    private readonly doc: WorkflowDocument,
    options: HistoryOptions = {},
  ) {
    this.limit = options.limit ?? 200
    this.mergeWindowMs = options.mergeWindowMs ?? 1000
    this.clock = options.clock ?? Date.now
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  get undoLabel(): string | undefined {
    return this.undoStack[this.undoStack.length - 1]?.label
  }

  get redoLabel(): string | undefined {
    return this.redoStack[this.redoStack.length - 1]?.label
  }

  /**
   * Apply a command and record it for undo.
   *
   * @throws DocumentError when the command does not fit the document; nothing is recorded
   */
  execute(command: Command): void {
    command.apply(this.doc)
    const now = this.clock()
    const top = this.undoStack[this.undoStack.length - 1]
    const merged = top && now - this.lastExecutedAt <= this.mergeWindowMs ? command.mergeWith?.(top) : null
    if (merged) this.undoStack[this.undoStack.length - 1] = merged
    else this.push(command)
    this.lastExecutedAt = now
    this.redoStack.length = 0
    this.events.emit('applied', command.toOps())
    this.events.emit('changed')
  }

  /** @returns whether there was something to undo */
  undo(): boolean {
    const command = this.undoStack.pop()
    if (!command) return false
    command.revert(this.doc)
    this.redoStack.push(command)
    this.lastExecutedAt = Number.NEGATIVE_INFINITY
    this.events.emit('applied', command.toRevertOps())
    this.events.emit('changed')
    return true
  }

  /** @returns whether there was something to redo */
  redo(): boolean {
    const command = this.redoStack.pop()
    if (!command) return false
    command.apply(this.doc)
    this.undoStack.push(command)
    this.lastExecutedAt = Number.NEGATIVE_INFINITY
    this.events.emit('applied', command.toOps())
    this.events.emit('changed')
    return true
  }

  /** Forget all steps, e.g. after the document was reloaded from the server. */
  clear(): void {
    this.undoStack.length = 0
    this.redoStack.length = 0
    this.events.emit('changed')
  }

  private push(command: Command): void {
    this.undoStack.push(command)
    if (this.undoStack.length > this.limit) this.undoStack.shift()
  }
}
