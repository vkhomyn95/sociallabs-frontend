import { WorkflowFilter, type WorkflowState } from './types'

export const state = (): WorkflowState => ({
  items: [],
  nodeTypes: null,
  loading: false,
  error: null,
  filter: WorkflowFilter.ALL,
  search: '',
  switching: [],
})
