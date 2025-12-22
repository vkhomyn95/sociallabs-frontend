import { computed } from 'vue';
import { useNodeStore } from '@/stores/node';
import type { NodeInstance, NodeDefinition } from '@/stores/node/types';

/**
 * Composable для роботи з нодами
 */
export function useNode() {
  const nodeStore = useNodeStore();

  // ========== Getters ==========

  const categories = computed(() => nodeStore.categories);
  const selectedDefinition = computed(() => nodeStore.selectedNodeDefinition);
  const isLoading = computed(() => nodeStore.loading);
  const error = computed(() => nodeStore.error);

  // ========== Methods ==========

  /**
   * Завантажити доступні ноди
   */
  async function loadNodes() {
    await nodeStore.FETCH_AVAILABLE_NODES();
  }

  /**
   * Завантажити definition ноди
   */
  async function loadNodeDefinition(executor: string) {
    await nodeStore.FETCH_NODE_DEFINITION(executor);
  }

  /**
   * Отримати ноди за категорією
   */
  function getNodesByCategory(category: string) {
    return nodeStore.getNodesByCategory(category);
  }

  /**
   * Пошук нод
   */
  function searchNodes(query: string) {
    return nodeStore.searchNodes(query);
  }

  /**
   * Отримати definition синхронно
   */
  function getDefinition(executor: string): NodeDefinition | null {
    return nodeStore.GET_NODE_DEFINITION(executor);
  }

  /**
   * Створити нову ноду
   */
  function createNode(
    executor: string,
    position: { x: number; y: number }
  ): Partial<NodeInstance> | null {
    const definition = getDefinition(executor);
    if (!definition) return null;

    return createNodeInstance(definition, position);
  }

  /**
   * Клонувати ноду
   */
  function duplicateNode(
    node: NodeInstance,
    offset = { x: 50, y: 50 }
  ): NodeInstance {
    return cloneNode(node, offset);
  }

  /**
   * Отримати видимі параметри для ноди
   */
  function getVisibleParams(
    definition: NodeDefinition | null,
    parameters: Record<string, any>
  ) {
    return getVisibleParameters(definition, parameters);
  }

  /**
   * Валідувати ноду
   */
  function validateNode(definition: NodeDefinition, parameters: Record<string, any>) {
    return validateNodeParameters(definition, parameters);
  }

  /**
   * Перевірити чи налаштована нода
   */
  function checkNodeConfigured(definition: NodeDefinition, node: NodeInstance) {
    return isNodeConfigured(definition, node);
  }

  /**
   * Отримати прогрес налаштування
   */
  function getProgress(definition: NodeDefinition, node: NodeInstance) {
    return getConfigurationProgress(definition, node);
  }

  /**
   * Отримати summary ноди
   */
  function getSummary(node: NodeInstance, definition: NodeDefinition | null) {
    return getNodeSummary(node, definition);
  }

  /**
   * Отримати дефолтні параметри
   */
  function getDefaults(definition: NodeDefinition) {
    return getDefaultParameters(definition);
  }

  /**
   * Очистити вибрану ноду
   */
  function clearSelection() {
    nodeStore.CLEAR_SELECTED_NODE();
  }

  return {
    // State
    categories,
    selectedDefinition,
    isLoading,
    error,

    // Methods
    loadNodes,
    loadNodeDefinition,
    getNodesByCategory,
    searchNodes,
    getDefinition,
    createNode,
    duplicateNode,
    getVisibleParams,
    validateNode,
    checkNodeConfigured,
    getProgress,
    getSummary,
    getDefaults,
    clearSelection
  };
}

/**
 * Composable для роботи з конкретною нодою
 */
export function useNodeInstance(node: NodeInstance) {
  const nodeStore = useNodeStore();

  const definition = computed(() =>
    nodeStore.GET_NODE_DEFINITION(node.discriminator)
  );

  const visibleParameters = computed(() => {
    if (!definition.value) return [];
    return getVisibleParameters(definition.value, node.parameters);
  });

  const isConfigured = computed(() => {
    if (!definition.value) return false;
    return isNodeConfigured(definition.value, node);
  });

  const configProgress = computed(() => {
    if (!definition.value) return 0;
    return getConfigurationProgress(definition.value, node);
  });

  const validation = computed(() => {
    if (!definition.value) return { valid: true, errors: [] };
    return validateNodeParameters(definition.value, node.parameters);
  });

  const summary = computed(() => {
    return getNodeSummary(node, definition.value);
  });

  return {
    definition,
    visibleParameters,
    isConfigured,
    configProgress,
    validation,
    summary
  };
}
