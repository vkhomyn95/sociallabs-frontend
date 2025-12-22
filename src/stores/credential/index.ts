import { defineStore } from 'pinia'
import { state } from './state'
import { getters } from './getters'
import { actions } from './actions'

export const useCredentialStore = defineStore('credential', {
  state: () => state,
  getters,
  actions
});

export * from './types';
export * from './service';
