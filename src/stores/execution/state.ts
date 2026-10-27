import type { ExecutionState } from './types'

export const state = (): ExecutionState => ({
  items: [],
  nextCursor: null,
  loading: false,
  loadingMore: false,
  error: null,
  filters: { workflowId: null, status: null },
  workflows: [],
  generation: 0,
})
