import { NodeCategory, NodeDiscriminator } from '@/stores/node/types.ts'

export const NodeIcons = {
  // Communication
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: 'fab fa-telegram',
  [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]: 'fab fa-telegram',
  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]: 'fab fa-telegram-plane',
  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]: 'fab fa-telegram-plane',

  [NodeDiscriminator.VIBER_BOT_ACTION]: 'fa-brands fa-viber',
  [NodeDiscriminator.VIBER_BOT_TRIGGER]: 'fa-brands fa-viber',
  [NodeDiscriminator.VIBER_CLIENT_ACTION]: 'fa-brands fa-viber',
  [NodeDiscriminator.VIBER_CLIENT_TRIGGER]: 'fa-brands fa-viber',

  [NodeDiscriminator.WHATSAPP_BOT_ACTION]: 'fa-brands fa-whatsapp',
  [NodeDiscriminator.WHATSAPP_BOT_TRIGGER]: 'fa-brands fa-whatsapp',
  [NodeDiscriminator.WHATSAPP_CLIENT_ACTION]: 'fa-brands fa-whatsapp',
  [NodeDiscriminator.WHATSAPP_CLIENT_TRIGGER]: 'fa-brands fa-whatsapp',

  [NodeDiscriminator.MESSENGER_BOT_ACTION]: 'fa-brands fa-facebook-messenger',
  [NodeDiscriminator.MESSENGER_BOT_TRIGGER]: 'fa-brands fa-facebook-messenger',
  [NodeDiscriminator.INSTAGRAM_BOT_ACTION]: 'fa-brands fa-instagram',
  [NodeDiscriminator.INSTAGRAM_BOT_TRIGGER]: 'fa-brands fa-instagram',

  // Logic
  [NodeDiscriminator.IF_LOGIC]: 'fas fa-code-branch',
  [NodeDiscriminator.SWITCH_LOGIC]: 'fas fa-random',

  // Core
  [NodeDiscriminator.HTTP_REQUEST]: 'fas fa-globe',

  // AI
  [NodeDiscriminator.AI_AGENT]: 'fas fa-robot',
} as const;

// ========== Colors ==========

export const NodeColors = {
  // Communication
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]: '#0088cc',

  [NodeDiscriminator.VIBER_BOT_ACTION]: '#7360f2',
  [NodeDiscriminator.VIBER_BOT_TRIGGER]: '#7360f2',
  [NodeDiscriminator.VIBER_CLIENT_ACTION]: '#7360f2',
  [NodeDiscriminator.VIBER_CLIENT_TRIGGER]: '#7360f2',

  [NodeDiscriminator.WHATSAPP_BOT_ACTION]: '#25d366',
  [NodeDiscriminator.WHATSAPP_BOT_TRIGGER]: '#25d366',
  [NodeDiscriminator.WHATSAPP_CLIENT_ACTION]: '#25d366',
  [NodeDiscriminator.WHATSAPP_CLIENT_TRIGGER]: '#25d366',

  [NodeDiscriminator.MESSENGER_BOT_ACTION]: '#168AFF',
  [NodeDiscriminator.MESSENGER_BOT_TRIGGER]: '#168AFF',
  [NodeDiscriminator.INSTAGRAM_BOT_ACTION]: '#FF7A00',
  [NodeDiscriminator.INSTAGRAM_BOT_TRIGGER]: '#FF7A00',

  // Logic
  [NodeDiscriminator.IF_LOGIC]: '#ef4444',
  [NodeDiscriminator.SWITCH_LOGIC]: '#f59e0b',

  // Core
  [NodeDiscriminator.HTTP_REQUEST]: '#2563eb',

  // AI
  [NodeDiscriminator.AI_AGENT]: '#7c3aed',
} as const;

// ========== Category Display ==========

export const CategoryDisplay: Record<NodeCategory, { icon: string; color: string }> = {
  [NodeCategory.COMMUNICATION]: {
    icon: 'fas fa-comments',
    color: '#0088cc',
  },
  [NodeCategory.LOGIC]: {
    icon: 'fas fa-code-branch',
    color: '#ef4444',
  },
  [NodeCategory.CORE]: {           // ← був відсутній
    icon: 'fas fa-globe',
    color: '#2563eb',
  },
  [NodeCategory.AI]: {
    icon: 'fas fa-robot',
    color: '#7c3aed',
  },
}

// ========== Helper Functions ==========

export function getCategoryDisplay(category: NodeCategory) {
  return CategoryDisplay[category] || {
    icon: 'fas fa-folder',
    color: '#6b7280'
  };
}
