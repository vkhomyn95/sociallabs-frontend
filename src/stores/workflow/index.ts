import { defineStore } from 'pinia'
import { state } from './state'
import { getters } from './getters'
import { actions } from './actions'

/** Workflow list: the cards of the Workflows page and the actions on them. */
export const useWorkflowStore = defineStore('workflow', {
  state,
  getters,
  actions,
})

export * from './types'
export * from './service'
export { messageOf } from './actions'
