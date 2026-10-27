import type { ExecutionStatus, ExecutionSummary } from '@/core/execution/types'

export interface ExecutionFilters {
  /** Only executions of this workflow, null for all. */
  workflowId: number | null
  /** Only executions in this status, null for any. */
  status: ExecutionStatus | null
}

/** A workflow as the history names it. */
export interface WorkflowRef {
  id: number
  name: string
  active: boolean
}

export interface ExecutionState {
  /** Loaded executions, newest first. */
  items: ExecutionSummary[]
  /** Cursor of the next page, null when the last page is loaded. */
  nextCursor: string | null
  loading: boolean
  loadingMore: boolean
  /** Why the last load failed, null after a successful one. */
  error: string | null
  filters: ExecutionFilters
  workflows: WorkflowRef[]
  /** Incremented by every reload, so a slower stale response cannot overwrite a newer one. */
  generation: number
}
