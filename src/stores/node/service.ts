import type { APIResponse } from '@/core/models/Api'
import {
  type AvailableNodes,
  NodeCategory,
  type NodeDefinition,
  type NodeInstance,
  NodeType
} from './types'
import api from '@/core/services/api.ts'

export const NodeService = {

  /**
   * Завантажити доступні ноди з бекенду
   */
  async loadAvailableNodes(
    type?: NodeType,
    category?: NodeCategory
  ): Promise<APIResponse<AvailableNodes>> {
    try {
      const params: Record<string, any> = {};
      if (type) params.type = type;
      if (category) params.category = category;

      const response = await api.get('nodes', params);

      // Backend повертає масив NodeMetadata[]
      const nodes = response.data;

      // Групуємо по категоріях
      const categories: Record<string, any[]> = {};

      nodes.forEach((node: any) => {
        const cat = node.category || 'UNKNOWN';
        if (!categories[cat]) {
          categories[cat] = [];
        }
        categories[cat].push(node);
      });

      return {
        success: true,
        data: {
          nodes,
          categories
        }
      };
    } catch (error: any) {
      console.error('Error loading available nodes:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Завантажити повний definition ноди (поки не реалізовано на бекенді)
   * Використовуємо локальні definitions
   */
  async loadNodeDefinition(executor: string): Promise<APIResponse<NodeDefinition>> {
    try {
      // TODO: Коли бекенд додасть endpoint для full definition
      // const response = await axios.get(`${API_URL}/${executor}/definition`);
      // return { success: true, data: response.data };

      return {
        success: false,
        error: 'Node definition endpoint not implemented on backend'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Завантажити повний definition ноди (поки не реалізовано на бекенді)
   * Використовуємо локальні definitions
   */
  async testNodeDefinition(node: NodeInstance): Promise<APIResponse<NodeDefinition>> {
    try {
      return await api.post(`nodes/${node.discriminator}/test`, node);
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};
