import { defineStore } from 'pinia'
import { state } from './state'
import { getters } from './getters'
import { actions } from './actions'

/** Execution history: the filtered list of the Executions page and the actions on its rows. */
export const useExecutionStore = defineStore('execution', {
  state,
  getters,
  actions,
})

export * from './types'
export * from './service'
export { UNFINISHED } from './getters'
