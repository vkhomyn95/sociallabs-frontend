import { ExecutionStatus } from '@/core/execution/types'
import type { ExecutionState } from './types'

/** Statuses of executions that have not finished yet. */
export const UNFINISHED: ReadonlySet<ExecutionStatus> = new Set([
  ExecutionStatus.NEW,
  ExecutionStatus.QUEUED,
  ExecutionStatus.RUNNING,
  ExecutionStatus.WAITING,
])

export const getters = {
  hasMore: (state: ExecutionState): boolean => state.nextCursor !== null,

  /** Whether a loaded execution is still running, so the list is worth refreshing. */
  hasUnfinished: (state: ExecutionState): boolean => state.items.some((execution) => UNFINISHED.has(execution.status)),

  /** Workflow name by id; a deleted workflow keeps its number. */
  workflowName: (state: ExecutionState) => (id: number): string =>
    state.workflows.find((workflow) => workflow.id === id)?.name ?? `Workflow #${id}`,

  /** Whether the workflow's triggers run; null until the workflows are loaded or when it was deleted. */
  workflowActive: (state: ExecutionState) => (id: number): boolean | null =>
    state.workflows.find((workflow) => workflow.id === id)?.active ?? null,
}
