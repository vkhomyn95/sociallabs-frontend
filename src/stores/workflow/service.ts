import api from '@/core/services/api'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { WorkflowDto } from '@/core/workflow/dto'

const BASE = '/workflows'

export const WorkflowService = {
  async list(): Promise<WorkflowDto[]> {
    return (await api.get<WorkflowDto[]>(BASE)).data
  },

  async create(name: string): Promise<WorkflowDto> {
    return (await api.post<WorkflowDto>(BASE, { name, nodes: [], connections: [] })).data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },

  /** Activating publishes the draft first when it was never published. */
  async setActive(id: number, active: boolean): Promise<WorkflowDto> {
    return (await api.post<WorkflowDto>(`${BASE}/${id}/${active ? 'activate' : 'deactivate'}`)).data
  },

  async nodeTypes(): Promise<NodeTypeDescriptor[]> {
    return (await api.get<NodeTypeDescriptor[]>('/node-types')).data
  },
}
