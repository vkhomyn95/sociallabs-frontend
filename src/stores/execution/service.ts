import api from '@/core/services/api'
import type { ExecutionDetail, ExecutionPage, ExecutionWorkflow, RunData } from '@/core/execution/types'
import { WorkflowService } from '@/stores/workflow/service'
import type { ExecutionFilters, WorkflowRef } from './types'

const BASE = '/executions'

/** Page size of the history list; the backend caps it at 100. */
export const PAGE_SIZE = 30

/** `POST /workflows/{id}/execute?wait=false` */
export interface StartedExecution {
  /** 0 when the run was rejected before it started. */
  executionId: number
  status: string
  error: string | null
}

export const ExecutionService = {
  /** Run the saved draft of a workflow manually, without waiting for it to finish. */
  async start(workflowId: number): Promise<StartedExecution> {
    return (await api.post<StartedExecution>(`/workflows/${workflowId}/execute`, {}, { params: { wait: false } })).data
  },

  async list(filters: ExecutionFilters, cursor: string | null = null, limit = PAGE_SIZE): Promise<ExecutionPage> {
    const { data } = await api.get<ExecutionPage>(BASE, {
      params: { workflowId: filters.workflowId ?? undefined, status: filters.status ?? undefined, cursor: cursor ?? undefined, limit },
    })
    return data
  },

  async detail(id: number): Promise<ExecutionDetail> {
    return (await api.get<ExecutionDetail>(`${BASE}/${id}`)).data
  },

  /** Items of every node; 404 when the execution kept none. */
  async data(id: number): Promise<RunData> {
    return (await api.get<RunData>(`${BASE}/${id}/data`)).data
  },

  async workflow(id: number): Promise<ExecutionWorkflow> {
    return (await api.get<ExecutionWorkflow>(`${BASE}/${id}/workflow`)).data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },

  /** @returns id of the new execution */
  async retry(id: number): Promise<number> {
    return (await api.post<{ executionId: number }>(`${BASE}/${id}/retry`)).data.executionId
  },

  async workflows(): Promise<WorkflowRef[]> {
    return (await WorkflowService.list()).map(({ id, name, active }) => ({ id, name, active }))
  },
}
