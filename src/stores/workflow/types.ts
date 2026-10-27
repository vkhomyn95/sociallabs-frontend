import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { WorkflowDto } from '@/core/workflow/dto'

/** Which workflows the list shows by state. */
export enum WorkflowFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface WorkflowState {
  items: WorkflowDto[]
  /** Node types, to tell triggers from other nodes on the cards; null until loaded. */
  nodeTypes: NodeTypeDescriptor[] | null
  loading: boolean
  /** Why the last load failed, null after a successful one. */
  error: string | null
  filter: WorkflowFilter
  search: string
  /** Workflows being activated or deactivated, so their cards can show it. */
  switching: number[]
}
