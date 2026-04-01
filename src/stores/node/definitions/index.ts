import {
  type EnrichedNodeMetadata,
  type NodeDefinition,
  NodeDiscriminator,
  type NodeMetadata
} from '../types'
import { TelegramBotActionNodeDefinition } from './telegram-bot-action'
import {
  TelegramClientActionNodeDefinition
} from '@/stores/node/definitions/telegram-client-action.ts'
import {
  TelegramClientTriggerNodeDefinition
} from '@/stores/node/definitions/telegram-client-trigger.ts'
import { IfNodeDefinition } from '@/stores/node/definitions/if-logic.ts'
import { SwitchNodeDefinition } from '@/stores/node/definitions/switch-logic.ts'
import { AiAgentNodeDefinition } from '@/stores/node/definitions/ai-agent.ts'
import { HttpRequestNodeDefinition } from '@/stores/node/definitions/http-request.ts'

/**
 * Центральний реєстр всіх node definitions
 * Додавайте нові ноди сюди
 */
export const NodeRegistry: Partial<Record<NodeDiscriminator, NodeDefinition>> = {
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: TelegramBotActionNodeDefinition,
  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]: TelegramClientActionNodeDefinition,
  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]: TelegramClientTriggerNodeDefinition,
  [NodeDiscriminator.IF_LOGIC]: IfNodeDefinition,
  [NodeDiscriminator.SWITCH_LOGIC]: SwitchNodeDefinition,
  [NodeDiscriminator.AI_AGENT]: AiAgentNodeDefinition,
  [NodeDiscriminator.HTTP_REQUEST]: HttpRequestNodeDefinition,
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
