/** Execution history DTOs of `/api/v1/executions`; enums mirror the backend. */

export enum ExecutionStatus {
  NEW = 'NEW',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
}

export enum ExecutionMode {
  TRIGGER = 'TRIGGER',
  MANUAL = 'MANUAL',
  RETRY = 'RETRY',
}

export enum NodeRunStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  /** Not run: no incoming branch produced items. */
  SKIPPED = 'SKIPPED',
}

export enum ExecutionEventType {
  EXECUTION_STARTED = 'EXECUTION_STARTED',
  NODE_STARTED = 'NODE_STARTED',
  NODE_FINISHED = 'NODE_FINISHED',
  EXECUTION_FINISHED = 'EXECUTION_FINISHED',
}

/** Live event sent over SSE; statuses and counts only, items come from `/data`. */
export interface ExecutionEvent {
  type: ExecutionEventType
  executionId: number
  workflowId: number
  nodeId: string | null
  /** NodeRunStatus for NODE_FINISHED, ExecutionStatus for EXECUTION_FINISHED. */
  status: string | null
  itemsOut: number | null
  durationMs: number | null
  error: string | null
  at: string
}

export interface ExecutionSummary {
  id: number
  workflowId: number
  status: ExecutionStatus
  mode: ExecutionMode
  triggerNodeId: string | null
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  errorNodeId: string | null
  errorMessage: string | null
}

export interface ExecutionPage {
  items: ExecutionSummary[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ExecutionDetail {
  execution: ExecutionSummary
  nodes: Array<{
    nodeId: string
    status: NodeRunStatus
    startedAt: string | null
    durationMs: number
    attempts: number
    itemsOut: number
    error: string | null
  }>
  dataAvailable: boolean
}

export type ItemJson = Record<string, unknown>

export interface RunItem {
  json: ItemJson
  binary?: Record<string, unknown>
}

export interface NodeRunRecord {
  nodeId: string
  status: NodeRunStatus
  /** Items per output port. */
  output: RunItem[][]
  error: string | null
  startedAt: string | null
  durationMs: number
  attempts: number
}

/** `GET /executions/{id}/data`: run record of every reached node. */
export interface RunData {
  version: number
  nodes: Record<string, NodeRunRecord>
}
