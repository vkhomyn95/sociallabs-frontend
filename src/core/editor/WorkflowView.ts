import type { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import type { WorkflowEditorSession } from './WorkflowEditorSession'

/** The edits the canvas and the node details view make; the editor session implements them. */
export type WorkflowCommands = Pick<
  WorkflowEditorSession,
  'insertNode' | 'connect' | 'move' | 'remove' | 'update' | 'paste' | 'duplicate' | 'setDisabled'
>

/**
 * A workflow as the canvas and the node details view show it. `commands` is null for a read-only view
 * (an execution), so components never edit what they may only show.
 */
export interface WorkflowView {
  readonly workflowId: number
  readonly document: WorkflowDocument
  readonly commands: WorkflowCommands | null
}

/** The open draft: edits are commands on the session, saved and undoable. */
export const editableView = (session: WorkflowEditorSession): WorkflowView => ({
  workflowId: session.workflowId,
  document: session.document,
  commands: session,
})

/** A graph that is only looked at, e.g. the one an execution ran on. */
export const readOnlyView = (workflowId: number, document: WorkflowDocument): WorkflowView => ({
  workflowId,
  document,
  commands: null,
})
