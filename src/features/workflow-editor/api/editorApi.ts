import { isAxiosError } from 'axios'
import api from '@/core/services/api'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { DraftConflictError, DraftRejectedError, type DraftApi } from '@/core/sync/DraftApi'
import type { DraftOp } from '@/core/sync/ops'
import type { WorkflowDto } from '@/core/workflow/dto'
import { WorkflowService } from '@/stores/workflow/service'

/** `POST /workflows/{id}/publish` */
export interface PublishResult {
  versionId: number
  versionNo: number
  /** False when the draft equals the active version and nothing was created. */
  created: boolean
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

  nodeTypes: (): Promise<NodeTypeDescriptor[]> => WorkflowService.nodeTypes(),

  async rename(id: number, name: string, description: string | null): Promise<WorkflowDto> {
    return (await api.patch<WorkflowDto>(`/workflows/${id}`, { name, description })).data
  },

  async publish(id: number): Promise<PublishResult> {
    return (await api.post<PublishResult>(`/workflows/${id}/publish`)).data
  },

  setActive: (id: number, active: boolean): Promise<WorkflowDto> => WorkflowService.setActive(id, active),

  errorMessage: serverMessage,
}
