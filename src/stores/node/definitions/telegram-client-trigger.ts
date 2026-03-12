import {
  CredentialType,
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types.ts'
import { NodeColors, NodeIcons } from '@/stores/node/constants.ts'

export const TelegramClientTriggerNodeDefinition: NodeDefinition = {
  // Metadata
  executor: NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER,
  type: NodeType.TRIGGER,
  category: NodeCategory.COMMUNICATION,

  // Display
  name: 'Telegram Client Trigger',
  description: 'Trigger workflow on Telegram events via MTProto',
  icon: NodeIcons.TELEGRAM_CLIENT,
  color: NodeColors.TELEGRAM,

  // Configuration
  supportedCredentialTypes: [CredentialType.TELEGRAM_CLIENT],
  requiresCredentials: true,
  supportsMultipleItems: false,

  // Parameters
  parameters: [
    // ========== Main Event ==========
    {
      name: 'events',
      displayName: 'Trigger Events',
      description: 'Type of events that triggers the workflow',
      type: ParameterType.OPTIONS,
      required: true,
      default: null,
      options: [
        { value: 'NEW_MESSAGE', name: '📩 New Message', description: 'When new message is received' },
        { value: 'MESSAGE_EDITED', name: '✏️ Message Edited', description: 'When message is edited' },
        { value: 'MESSAGE_DELETED', name: '🗑️ Message Deleted', description: 'When message is deleted' },
        { value: 'NEW_CHAT', name: '💬 New Chat', description: 'When new chat is created' },
        { value: 'CHAT_UPDATED', name: '🔄 Chat Updated', description: 'When chat info changes' },
        { value: 'USER_STATUS_CHANGED', name: '👤 User Status Changed', description: 'When user online status changes' },
        { value: 'CHAT_MEMBER_UPDATED', name: '👥 Chat Member Updated', description: 'When member joins/leaves/role changes' },
        { value: 'CALLBACK_QUERY', name: '🔘 Callback Query', description: 'When inline button is clicked' },
        { value: 'INLINE_QUERY', name: '🔍 Inline Query', description: 'When inline query is received' }
      ]
    },
  ],
  // Outputs
  outputs: {
    main: {
      name: 'main',
      displayName: 'Main Output',
      type: 'object',
      description: 'Response from Telegram API'
    }
  }
};
