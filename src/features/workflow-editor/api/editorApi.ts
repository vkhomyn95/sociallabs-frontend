import { isAxiosError } from 'axios'
import api from '@/core/services/api'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { DraftConflictError, DraftRejectedError, type DraftApi } from '@/core/sync/DraftApi'
import type { DraftOp } from '@/core/sync/ops'
import type { WorkflowDto } from '@/core/workflow/dto'

/** `POST /workflows/{id}/publish` */
export interface PublishResult {
  versionId: number
  versionNo: number
  /** False when the draft equals the active version and nothing was created. */
  created: boolean
}

/** `POST /workflows/{id}/execute` */
export interface ManualExecutionResult {
  executionId: number
  status: string
  error?: string | null
}

const serverMessage = (error: unknown): string =>
  (isAxiosError(error) && (error.response?.data as { message?: string } | undefined)?.message) ||
  (error instanceof Error ? error.message : String(error))

/** HTTP adapter of the draft port: maps 409 to a conflict and other 4xx to a rejection. */
export const httpDraftApi: DraftApi = {
  async patch(workflowId: number, baseRevision: number, ops: DraftOp[]) {
    try {
      const { data } = await api.patch<{ revision: number }>(`/workflows/${workflowId}/draft`, { baseRevision, ops })
      return data
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 409) throw new DraftConflictError(serverMessage(error))
      if (status !== undefined && status >= 400 && status < 500 && status !== 401 && status !== 408 && status !== 429) {
        throw new DraftRejectedError(serverMessage(error))
      }
      throw error
    }
  },
}

/** Workflow endpoints the editor uses besides draft saves. */
export const editorApi = {
  async load(id: number): Promise<WorkflowDto> {
    return (await api.get<WorkflowDto>(`/workflows/${id}`)).data
  },

  async create(name: string): Promise<WorkflowDto> {
    return (await api.post<WorkflowDto>('/workflows', { name, nodes: [], connections: [] })).data
  },

  async nodeTypes(): Promise<NodeTypeDescriptor[]> {
    return (await api.get<NodeTypeDescriptor[]>('/node-types')).data
  },

  async rename(id: number, name: string, description: string | null): Promise<WorkflowDto> {
    return (await api.patch<WorkflowDto>(`/workflows/${id}`, { name, description })).data
  },

  async publish(id: number): Promise<PublishResult> {
    return (await api.post<PublishResult>(`/workflows/${id}/publish`)).data
  },

  async setActive(id: number, active: boolean): Promise<WorkflowDto> {
    return (await api.post<WorkflowDto>(`/workflows/${id}/${active ? 'activate' : 'deactivate'}`)).data
  },

  async execute(id: number): Promise<ManualExecutionResult> {
    // Manual runs wait for the execution; the default 10 s timeout is too short for real workflows.
    return (await api.post<ManualExecutionResult>(`/workflows/${id}/execute`, {}, { timeout: 120_000 })).data
  },

  errorMessage: serverMessage,
}
