import { type NodeDefinition, type NodeMetadata, type EnrichedNodeMetadata, NodeDiscriminator } from '../types';
import { TelegramBotActionNodeDefinition } from './telegram-bot-action';

/**
 * Центральний реєстр всіх node definitions
 * Додавайте нові ноди сюди
 */
export const NodeRegistry: Partial<Record<NodeDiscriminator, NodeDefinition>> = {
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: TelegramBotActionNodeDefinition,
  // [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]: TelegramBotTriggerDefinition,
  // Додайте інші ноди тут
};

/**
 * Отримати definition ноди за discriminator
 */
export function getNodeDefinition(discriminator: string | NodeDiscriminator): NodeDefinition | null {
  return NodeRegistry[discriminator as NodeDiscriminator] || null;
}

/**
 * Перевірити чи існує definition
 */
export function hasNodeDefinition(discriminator: string | NodeDiscriminator): boolean {
  return discriminator in NodeRegistry;
}

/**
 * Отримати всі definitions
 */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return Object.values(NodeRegistry).filter((d): d is NodeDefinition => d !== undefined);
}

/**
 * Збагатити метадані з бекенду повною definition
 */
export function enrichNodeMetadata(
  metadata: NodeMetadata,
  definition: NodeDefinition | null
): EnrichedNodeMetadata {
  if (!definition) {
    // Fallback якщо немає definition
    return {
      ...metadata,
      name: metadata.discriminator,
      description: 'No description available',
      icon: 'fas fa-cog',
      color: '#6b7280'
    };
  }

  return {
    ...metadata,
    name: definition?.name,
    description: definition?.description,
    icon: definition?.icon,
    color: definition?.color
  };
}
