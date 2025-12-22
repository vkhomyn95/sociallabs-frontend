import api from '@/core/services/api'
import type { APIResponse } from '@/core/models/Api'
import type { Credential, CredentialRequest } from './types'

export const CredentialService = {

  async loadAll(): Promise<APIResponse<Credential[]>> {
    try {
      const response = await api.get('/credentials');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to load credentials:', error);
      throw error;
    }
  },

  async loadByType(type: string): Promise<APIResponse<Credential[]>> {
    try {
      const response = await api.get(`/credentials/type/${type}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to load credentials by type:', error);
      throw error;
    }
  },

  async create(data: CredentialRequest): Promise<APIResponse<Credential>> {
    try {
      const response = await api.post('/credentials', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to create credential:', error);
      throw error;
    }
  },

  async update(id: number, data: CredentialRequest): Promise<APIResponse<Credential>> {
    try {
      const response = await api.put(`/credentials/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to update credential:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<APIResponse<void>> {
    try {
      await api.delete(`/credentials/${id}`);
      return {
        success: true,
        data: undefined
      };
    } catch (error: any) {
      console.error('Failed to delete credential:', error);
      throw error;
    }
  },

  async test(id: number): Promise<APIResponse<any>> {
    try {
      const response = await api.post(`/credentials/${id}/test`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to test credential:', error);
      throw error;
    }
  }
};
