import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';

export const useWorkflowStore = defineStore('workflow', {
  state: () => state,
  getters,
  actions
});
