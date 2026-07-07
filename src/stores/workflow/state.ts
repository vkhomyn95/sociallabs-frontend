import type { Workflow, WorkflowState } from './types'

export const state = (): WorkflowState => ({
  workflow: null as Workflow,
  workflows: [],
  count: 0,
  loading: false as boolean,
  error: null,
  currentNodeId: undefined
});
