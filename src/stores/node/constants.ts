import { NodeCategory, NodeDiscriminator } from '@/stores/node/types.ts'
import { ConnectionType } from '@/stores/workflow/types.ts'

export const NodeIcons = {
  // Communication
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: 'fab fa-telegram',
  [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]: 'fab fa-telegram',
  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]: 'fab fa-telegram-plane',
  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]: 'fab fa-telegram-plane',

  // Logic
  [NodeDiscriminator.IF_LOGIC]: 'fas fa-code-branch',
  [NodeDiscriminator.SWITCH_LOGIC]: 'fas fa-random',

  // Core
  [NodeDiscriminator.HTTP_REQUEST]: 'fas fa-globe',

  // AI
  [NodeDiscriminator.AI_AGENT]: 'fas fa-robot',








  // EMAIL: 'fas fa-envelope',
  // SMS: 'fas fa-sms',
  // WEBHOOK: 'fas fa-wifi',
  //
  // // Data
  // DATABASE: 'fas fa-database',
  // FILE: 'fas fa-file',
  // SPREADSHEET: 'fas fa-table',
  // API: 'fas fa-exchange-alt',
  //
  // // Logic
  // CONDITION: 'fas fa-code-branch',
  // LOOP: 'fas fa-sync',
  // SWITCH: 'fas fa-random',
  // MERGE: 'fas fa-object-group',
  //
  // // Utility
  // DELAY: 'fas fa-clock',
  // HTTP_REQUEST: 'fas fa-globe',
  // FUNCTION: 'fas fa-code',
  // SCHEDULE: 'fas fa-calendar-alt',
  //
  // // Transform
  // TRANSFORM: 'fas fa-exchange-alt',
  // FILTER: 'fas fa-filter',
  // SORT: 'fas fa-sort',
  // AGGREGATE: 'fas fa-chart-bar'
} as const;

// ========== Colors ==========

export const NodeColors = {
  // Communication
  [NodeDiscriminator.TELEGRAM_BOT_ACTION]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]: '#0088cc',
  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]: '#0088cc',

  // Logic
  [NodeDiscriminator.IF_LOGIC]: '#ef4444',
  [NodeDiscriminator.SWITCH_LOGIC]: '#f59e0b',

  // Core
  [NodeDiscriminator.HTTP_REQUEST]: '#2563eb',

  // AI
  [NodeDiscriminator.AI_AGENT]: '#7c3aed',


  // // Communication
  // TELEGRAM: '#0088cc',
  // EMAIL: '#ea4335',
  // SMS: '#34a853',
  // WEBHOOK: '#fbbc04',
  //
  // // Data
  // DATABASE: '#4285f4',
  // FILE: '#9333ea',
  // SPREADSHEET: '#10b981',
  // API: '#f59e0b',
  //
  // // Logic
  // CONDITION: '#ef4444',
  // LOOP: '#8b5cf6',
  // SWITCH: '#ec4899',
  // MERGE: '#06b6d4',
  //
  // // Utility
  // DELAY: '#6366f1',
  // HTTP: '#3b82f6',
  // FUNCTION: '#14b8a6',
  // SCHEDULE: '#f97316',
  //
  // // Transform
  // TRANSFORM: '#a855f7',
  // FILTER: '#22c55e',
  // SORT: '#eab308',
  // AGGREGATE: '#0ea5e9'
} as const;

// ========== Category Display ==========

export const CategoryDisplay: Record<NodeCategory, { icon: string; color: string }> = {
  [NodeCategory.COMMUNICATION]: {
    icon: 'fas fa-comments',
    color: '#0088cc'
  },
  [NodeCategory.LOGIC]: {
    icon: 'fas fa-code-branch',
    color: '#ef4444'
  },
  [NodeCategory.AI]: {
    icon: 'fas fa-robot',
    color: '#7c3aed'
  }
};

// ========== Helper Functions ==========

export function getCategoryDisplay(category: NodeCategory) {
  return CategoryDisplay[category] || {
    icon: 'fas fa-folder',
    color: '#6b7280'
  };
}

const SUB_SLOT_EDGE_STYLE: Record<string, { color: string }> = {
  [ConnectionType.AI_AGENT]:   { color: '#8b5cf6' },  // chat model — фіолетовий
  [ConnectionType.AI_MEMORY]:  { color: '#06b6d4' },  // memory — cyan
  [ConnectionType.AI_TOOL]:    { color: '#10b981' },  // tool — зелений
}
