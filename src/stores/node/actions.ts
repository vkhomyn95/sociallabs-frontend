import type { APIResponse } from '@/core/models/Api'
import type { AvailableNodes, NodeDefinition, NodeState } from './types'
import { NodeService } from './service'
import { getNodeDefinition } from '@/stores/node/definitions'
import { NodeCategory } from './types'

export const actions = {

  /**
   * Завантажити доступні ноди з бекенду
   */
  async FETCH_AVAILABLE_NODES(
    this: NodeState,
    type?: NodeType,
    category?: NodeCategory
  ): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<AvailableNodes> = await NodeService.loadAvailableNodes(type, category);

      if (res.success && res.data) {
        this.availableNodes = res.data;
      } else {
        this.error = res.error || 'Failed to load nodes';
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch available nodes:', error);
    } finally {
      this.loading = false;
    }
  },

  /**
   * Завантажити повний definition ноди
   * Спочатку шукає локально, потім на бекенді (коли буде реалізовано)
   */
  async FETCH_NODE_DEFINITION(this: NodeState, discriminator: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Спробувати знайти локально
      const localDefinition = getNodeDefinition(discriminator);

      if (localDefinition) {
        this.selectedNodeDefinition = localDefinition;
        this.loading = false;
        return;
      }

      // Якщо немає локально - завантажити з бекенду (поки не реалізовано)
      const res: APIResponse<NodeDefinition> = await NodeService.loadNodeDefinition(discriminator);

      if (res.success && res.data) {
        this.selectedNodeDefinition = res.data;
      } else {
        this.error = `Node definition not found for: ${discriminator}`;
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch node definition:', error);
    } finally {
      this.loading = false;
    }
  },

  /**
   * Отримати definition ноди (синхронно)
   */
  GET_NODE_DEFINITION(discriminator: string): NodeDefinition | null {
    return getNodeDefinition(discriminator);
  },

  /**
   * Тестування definition ноди (синхронно)
   */
  TEST_NODE_DEFINITION(node: NodeDefinition) {
    return NodeService.testNodeDefinition(node)
  },

  /**
   * Очистити вибрану ноду
   */
  CLEAR_SELECTED_NODE(this: NodeState): void {
    this.selectedNodeDefinition = null;
  }
};
