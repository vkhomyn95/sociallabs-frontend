import api from '@/core/services/api';
import type { APIResponse, LoadConfig } from '@/core/models/Api';
import type { Workflow } from './types';

export const WorkflowService = {

  async loadWorkflows(filter?: LoadConfig): Promise<APIResponse<Workflow[]>> {
    const response = await api.get('/workflows', { params: filter });
    return {
      success: true,
      data: response.data,
      count: response.data.length
    };
  },

  async loadById(id: number): Promise<APIResponse<Workflow>> {
    const response = await api.get(`/workflows/${id}`);
    return {
      success: true,
      data: response.data
    };
  },

  async createWorkflow(data: Workflow): Promise<APIResponse<Workflow>> {
    const response = await api.post('/workflows', data);
    return {
      success: true,
      data: response.data
    };
  },

  async updateWorkflow(id: number, data: Workflow): Promise<APIResponse<Workflow>> {
    const response = await api.put(`/workflows/${id}`, data);
    return {
      success: true,
      data: response.data
    };
  },

  async deleteWorkflow(id: number): Promise<APIResponse<void>> {
    await api.delete(`/workflows/${id}`);
    return {
      success: true,
      data: undefined
    };
  },

  async toggleWorkflow(id: number): Promise<APIResponse<Workflow>> {
    const response = await api.post(`/workflows/${id}/toggle`);
    return {
      success: true,
      data: response.data
    };
  },

  async executeWorkflow(id: number, triggerData?: any): Promise<APIResponse<any>> {
    const response = await api.post(`/workflows/${id}/execute`, triggerData);
    return {
      success: true,
      data: response.data
    };
  }
};
