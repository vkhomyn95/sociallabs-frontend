import type { WorkflowDto } from '@/core/workflow/dto'
import { WorkflowFilter, type WorkflowState } from './types'

const MATCHES: Readonly<Record<WorkflowFilter, (workflow: WorkflowDto) => boolean>> = {
  [WorkflowFilter.ALL]: () => true,
  [WorkflowFilter.ACTIVE]: (workflow) => workflow.active,
  [WorkflowFilter.INACTIVE]: (workflow) => !workflow.active,
}

export const getters = {
  /** Workflows of the selected state whose name or description contains the search text. */
  filtered: (state: WorkflowState): WorkflowDto[] => {
    const query = state.search.trim().toLowerCase()
    return state.items
      .filter(MATCHES[state.filter])
      .filter((workflow) => !query || [workflow.name, workflow.description ?? ''].some((text) => text.toLowerCase().includes(query)))
  },

  /** Number of workflows a filter would show, search aside. */
  countOf: (state: WorkflowState) => (filter: WorkflowFilter): number => state.items.filter(MATCHES[filter]).length,

  isSwitching: (state: WorkflowState) => (id: number): boolean => state.switching.includes(id),
}
