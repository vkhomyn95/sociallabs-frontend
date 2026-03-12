import type { APIResponse, LoadConfig } from '@/core/models/Api'
import type { Workflow, WorkflowState } from './types'
import { WorkflowService } from './service'
import { enrichNodeMetadata, getNodeDefinition } from '@/stores/node/definitions'
import { getNodeDisplayConfig } from '@/stores/node/constants.ts'

export const actions = {

  async FETCH_WORKFLOWS(this: WorkflowState, filter?: LoadConfig): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Workflow[]> = await WorkflowService.loadWorkflows(filter);
      if (res.success) {
        this.workflows = res.data;
        this.count = res.count || 0;
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch workflows:', error);
    } finally {
      this.loading = false;
    }
  },

  async FETCH_WORKFLOW_BY_ID(this: WorkflowState, id: number): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Workflow> = await WorkflowService.loadById(id);
      if (res.success && res.data) {
        // ✅ ВИПРАВЛЕННЯ 1: Використовуйте forEach або map замість for...in
        // for...in призначений для об'єктів, не для масивів
        res.data.nodes = res.data.nodes.map(node => {
          const config = getNodeDisplayConfig(node.discriminator);
          console.log(config);
          // ✅ ВИПРАВЛЕННЯ 2: Повертаємо новий об'єкт з об'єднаними властивостями
          return { ...node, ...config };
        });

        this.workflow = res.data;
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch workflow:', error);
    } finally {
      this.loading = false;
    }
  },

  async CREATE_WORKFLOW(this: WorkflowState, data: Workflow): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Workflow> = await WorkflowService.createWorkflow(data);
      if (res.success) {
        this.workflow = res.data;
        this.workflows.push(res.data);
        this.count++;
        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to create workflow:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async UPDATE_WORKFLOW(this: WorkflowState, id: number, data: Workflow): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Workflow> = await WorkflowService.updateWorkflow(id, data);
      if (res.success) {
        this.workflow = res.data;

        const index = this.workflows.findIndex(w => w.id === id);
        if (index !== -1) {
          this.workflows[index] = res.data;
        }

        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to update workflow:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async DELETE_WORKFLOW(this: WorkflowState, id: number): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<void> = await WorkflowService.deleteWorkflow(id);
      if (res.success) {
        this.workflows = this.workflows.filter(w => w.id !== id);
        this.count--;

        if (this.workflow?.id === id) {
          this.workflow = null;
        }

        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to delete workflow:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async TOGGLE_WORKFLOW(this: WorkflowState, id: number): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Workflow> = await WorkflowService.toggleWorkflow(id);
      if (res.success) {
        if (this.workflow?.id === id) {
          this.workflow = res.data;
        }

        const index = this.workflows.findIndex(w => w.id === id);
        if (index !== -1) {
          this.workflows[index] = res.data;
        }

        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to toggle workflow:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async EXECUTE_WORKFLOW(this: WorkflowState, id: number, triggerData?: any): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<any> = await WorkflowService.executeWorkflow(id, triggerData);
      if (res.success) {
        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to execute workflow:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  // Local actions (не API calls)
  ADD_NODE(this: WorkflowState, node: NodeInstance): void {
    if (this.workflow) {
      this.workflow.nodes.push(node);
    }
  },

  UPDATE_NODE(this: WorkflowState, nodeId: string, updates: Partial<NodeInstance>): void {
    console.log(updates, nodeId)
    if (!this.workflow) return;

    const index = this.workflow.nodes.findIndex(n => n.nodeId === nodeId);
    console.log(index)
    if (index !== -1) {
      this.workflow.nodes[index] = {
        ...this.workflow.nodes[index],
        ...updates
      };
    }
  },

  REMOVE_NODE(this: WorkflowState, nodeId: string): void {
    if (!this.workflow) return;

    // Remove node
    this.workflow.nodes = this.workflow.nodes.filter(n => n.nodeId !== nodeId);

    // Remove connections
    this.workflow.connections = this.workflow.connections.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
  },

  ADD_CONNECTION(this: WorkflowState, connection: Connection): void {
    if (this.workflow) {
      this.workflow.connections.push(connection);
    }
  },

  REMOVE_CONNECTION(this: WorkflowState, connectionId: number): void {
    if (!this.workflow) return;

    this.workflow.connections = this.workflow.connections.filter(
      c => c.id !== connectionId
    );
  },

  CLEAR_ERROR(this: WorkflowState): void {
    this.error = null;
  },

  RESET_WORKFLOW(this: WorkflowState): void {
    this.workflow = null;
    this.error = null;
  }
};
