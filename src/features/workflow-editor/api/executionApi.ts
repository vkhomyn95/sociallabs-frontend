import { EventSourcePolyfill } from 'event-source-polyfill'
import api, { API_URL } from '@/core/services/api'
import { getAccessToken } from '@/core/services/auth-token'
import type { NodeSample } from '@/core/execution/RunDataView'
import {
  ExecutionEventType,
  type ExecutionDetail,
  type ExecutionEvent,
  type ExecutionPage,
  type ExecutionSummary,
  type ItemJson,
  type RunData,
} from '@/core/execution/types'

/** `POST /workflows/{id}/execute?wait=false` */
export interface StartedExecution {
  /** 0 when the run was rejected before it started. */
  executionId: number
  status: string
  error: string | null
}

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
  async start(workflowId: number): Promise<StartedExecution> {
    return (await api.post<StartedExecution>(`/workflows/${workflowId}/execute`, {}, { params: { wait: false } })).data
  },

  async latest(workflowId: number): Promise<ExecutionSummary | null> {
    const { data } = await api.get<ExecutionPage>('/executions', { params: { workflowId, limit: 1 } })
    return data.items[0] ?? null
  },

  async detail(id: number): Promise<ExecutionDetail> {
    return (await api.get<ExecutionDetail>(`/executions/${id}`)).data
  },

  async data(id: number): Promise<RunData> {
    return (await api.get<RunData>(`/executions/${id}/data`)).data
  },

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
