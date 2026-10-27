import { EventSourcePolyfill } from 'event-source-polyfill'
import api, { API_URL } from '@/core/services/api'
import { getAccessToken } from '@/core/services/auth-token'
import type { NodeSample } from '@/core/execution/RunDataView'
import { ExecutionService, type StartedExecution } from '@/stores/execution/service'
import {
  ExecutionEventType,
  type ExecutionDetail,
  type ExecutionEvent,
  type ExecutionSummary,
  type ItemJson,
  type RunData,
} from '@/core/execution/types'

/** `POST /expressions/preview` */
export interface PreviewRequest {
  template: string
  workflowId: number
  itemIndex: number
  input: ItemJson[]
  nodes: NodeSample[]
}

export interface PreviewResult {
  value: unknown
  error: string | null
}

/** Execution endpoints the editor uses. */
export const executionApi = {
  start: (workflowId: number): Promise<StartedExecution> => ExecutionService.start(workflowId),

  async latest(workflowId: number): Promise<ExecutionSummary | null> {
    const page = await ExecutionService.list({ workflowId, status: null }, null, 1)
    return page.items[0] ?? null
  },

  detail: (id: number): Promise<ExecutionDetail> => ExecutionService.detail(id),

  data: (id: number): Promise<RunData> => ExecutionService.data(id),

  async preview(request: PreviewRequest): Promise<PreviewResult> {
    return (await api.post<PreviewResult>('/expressions/preview', request)).data
  },

  /**
   * Stream the events of one execution from its start; the stream ends after EXECUTION_FINISHED.
   *
   * @returns function that closes the stream
   */
  follow(executionId: number, onEvent: (event: ExecutionEvent) => void, onBroken: () => void): () => void {
    const source = new EventSourcePolyfill(`${API_URL}/executions/${executionId}/events`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      heartbeatTimeout: 60_000,
    })
    let finished = false
    const handle = (raw: MessageEvent): void => {
      const event = JSON.parse(raw.data) as ExecutionEvent
      if (event.type === ExecutionEventType.EXECUTION_FINISHED) {
        finished = true
        source.close()
      }
      onEvent(event)
    }
    // The backend names each SSE event after its type.
    Object.values(ExecutionEventType).forEach((type) => source.addEventListener(type, handle as unknown as EventListener))
    source.onerror = () => {
      if (finished) return
      finished = true
      source.close()
      onBroken()
    }
    return () => {
      finished = true
      source.close()
    }
  },
}
