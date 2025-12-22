import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';

export const useNodeStore = defineStore('node', {
  state: () => state,
  getters,
  actions
});
