import type { EnrichedNodeMetadata, NodeMetadata, NodeState } from './types'
import { enrichNodeMetadata, getNodeDefinition } from '@/stores/node/definitions'

export const getters = {
  /**
   * Backend metadata of a node type (credential requirements, category).
   */
  metadataOf(state: NodeState) {
    return (discriminator: string): NodeMetadata | undefined =>
      state.availableNodes?.nodes.find(node => node.discriminator === discriminator);
  },

  /**
   * Отримати всі категорії
   */
  categories(state: NodeState): string[] {
    if (!state.availableNodes) return [];
    return Object.keys(state.availableNodes.categories);
  },

  /**
   * Отримати ноди за категорією (збагачені метадані)
   */
  getNodesByCategory(state: NodeState) {
    return (category: string): EnrichedNodeMetadata[] => {
      const nodes = state.availableNodes?.categories[category] || [];

      // Збагатити кожну ноду definition
      return nodes.map(node => {
        console.log(node)
        const definition = getNodeDefinition(node.discriminator);
        console.log(definition)
        return enrichNodeMetadata(node, definition);
      });
    };
  },

  /**
   * Пошук нод
   */
  searchNodes(state: NodeState) {
    return (query: string): EnrichedNodeMetadata[] => {
      if (!state.availableNodes || !query) return [];

      const results: EnrichedNodeMetadata[] = [];
      const lowerQuery = query.toLowerCase();

      for (const nodes of Object.values(state.availableNodes.categories)) {
        for (const node of nodes) {
          const definition = getNodeDefinition(node.discriminator);
          const enriched = enrichNodeMetadata(node, definition);

          if (
            enriched.name.toLowerCase().includes(lowerQuery) ||
            enriched.description.toLowerCase().includes(lowerQuery)
          ) {
            results.push(enriched);
          }
        }
      }

      return results;
    };
  },

  /**
   * Чи завантажені ноди
   */
  isLoaded(state: NodeState): boolean {
    return state.availableNodes !== null;
  }
};
