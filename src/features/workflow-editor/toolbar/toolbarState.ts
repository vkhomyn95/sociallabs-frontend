import type { SyncStatus } from '@/core/sync/DraftSync'

/** What the editor's header shows: name and state of the workflow, save state, history and running flags. */
export interface ToolbarState {
  name: string
  active: boolean
  hasUnpublishedChanges: boolean
  status: SyncStatus
  error: string | null
  canUndo: boolean
  canRedo: boolean
  undoLabel?: string
  redoLabel?: string
  publishing: boolean
  executing: boolean
}
