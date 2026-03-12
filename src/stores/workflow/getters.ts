import type { WorkflowState } from './types';
import type { NodeInstance } from '@/stores/node/types.ts'

export const getters = {
  // Отримати ноду за ID
  getNodeById: (state: WorkflowState) => (nodeId: string): NodeInstance | undefined => {
    return state.workflow?.nodes.find(n => n.nodeId === nodeId);
  },

  // Отримати всі з'єднання для ноди
  getNodeConnections: (state: WorkflowState) => (nodeId: string) => {
    if (!state.workflow) return { incoming: [], outgoing: [] };

    return {
      incoming: state.workflow.connections.filter(c => c.targetNodeId === nodeId),
      outgoing: state.workflow.connections.filter(c => c.sourceNodeId === nodeId)
    };
  },

  // Чи є незбережені зміни
  hasUnsavedChanges: (state: WorkflowState): boolean => {
    // Implement logic to check if workflow was modified
    return false;
  },

  // Активні workflows
  activeWorkflows: (state: WorkflowState) => {
    return state.workflows.filter(w => w.active);
  },

  // Кількість нод в workflow
  nodeCount: (state: WorkflowState): number => {
    return state.workflow?.nodes.length || 0;
  }
};
