import { NodeCategory } from '@/stores/node/types.ts'

export const NodeIcons = {
  // Communication
  TELEGRAM_BOT: 'fab fa-telegram',
  TELEGRAM_CLIENT: 'fab fa-telegram-plane',
  EMAIL: 'fas fa-envelope',
  SMS: 'fas fa-sms',
  WEBHOOK: 'fas fa-wifi',

  // Data
  DATABASE: 'fas fa-database',
  FILE: 'fas fa-file',
  SPREADSHEET: 'fas fa-table',
  API: 'fas fa-exchange-alt',

  // Logic
  CONDITION: 'fas fa-code-branch',
  LOOP: 'fas fa-sync',
  SWITCH: 'fas fa-random',
  MERGE: 'fas fa-object-group',

  // Utility
  DELAY: 'fas fa-clock',
  HTTP_REQUEST: 'fas fa-globe',
  FUNCTION: 'fas fa-code',
  SCHEDULE: 'fas fa-calendar-alt',

  // Transform
  TRANSFORM: 'fas fa-exchange-alt',
  FILTER: 'fas fa-filter',
  SORT: 'fas fa-sort',
  AGGREGATE: 'fas fa-chart-bar'
} as const;

// ========== Colors ==========

export const NodeColors = {
  // Communication
  TELEGRAM: '#0088cc',
  EMAIL: '#ea4335',
  SMS: '#34a853',
  WEBHOOK: '#fbbc04',

  // Data
  DATABASE: '#4285f4',
  FILE: '#9333ea',
  SPREADSHEET: '#10b981',
  API: '#f59e0b',

  // Logic
  CONDITION: '#ef4444',
  LOOP: '#8b5cf6',
  SWITCH: '#ec4899',
  MERGE: '#06b6d4',

  // Utility
  DELAY: '#6366f1',
  HTTP: '#3b82f6',
  FUNCTION: '#14b8a6',
  SCHEDULE: '#f97316',

  // Transform
  TRANSFORM: '#a855f7',
  FILTER: '#22c55e',
  SORT: '#eab308',
  AGGREGATE: '#0ea5e9'
} as const;

// ========== Category Display ==========

export const CategoryDisplay: Record<NodeCategory, { icon: string; color: string }> = {
  [NodeCategory.COMMUNICATION]: {
    icon: 'fas fa-comments',
    color: '#0088cc'
  },
  // [NodeCategory.DATA]: {
  //   icon: 'fas fa-database',
  //   color: '#4285f4'
  // },
  // [NodeCategory.LOGIC]: {
  //   icon: 'fas fa-code-branch',
  //   color: '#ef4444'
  // },
  // [NodeCategory.UTILITY]: {
  //   icon: 'fas fa-tools',
  //   color: '#6366f1'
  // },
  // [NodeCategory.INTEGRATION]: {
  //   icon: 'fas fa-plug',
  //   color: '#10b981'
  // }
};

// ========== Node Display Configs ==========

export const NodeDisplayConfigs: Record<string, NodeDisplayConfig> = {
  // Telegram
  'TELEGRAM_BOT_ACTION': {
    icon: NodeIcons.TELEGRAM_BOT,
    color: NodeColors.TELEGRAM,
    category: NodeCategory.COMMUNICATION
  },
  // 'TELEGRAM_CLIENT_ACTION': {
  //   icon: NodeIcons.TELEGRAM_CLIENT,
  //   color: NodeColors.TELEGRAM,
  //   category: NodeCategory.COMMUNICATION
  // },
  //
  // // HTTP
  // 'HTTP_REQUEST': {
  //   icon: NodeIcons.HTTP_REQUEST,
  //   color: NodeColors.HTTP,
  //   category: NodeCategory.UTILITY
  // },
  //
  // // Logic
  // 'IF_CONDITION': {
  //   icon: NodeIcons.CONDITION,
  //   color: NodeColors.CONDITION,
  //   category: NodeCategory.LOGIC
  // },
  // 'SWITCH': {
  //   icon: NodeIcons.SWITCH,
  //   color: NodeColors.SWITCH,
  //   category: NodeCategory.LOGIC
  // },
  //
  // // Transform
  // 'SET': {
  //   icon: NodeIcons.TRANSFORM,
  //   color: NodeColors.TRANSFORM,
  //   category: NodeCategory.TRANSFORM
  // },
  // 'FILTER': {
  //   icon: NodeIcons.FILTER,
  //   color: NodeColors.FILTER,
  //   category: NodeCategory.TRANSFORM
  // }
};

// ========== Helper Functions ==========

export function getNodeDisplayConfig(executor: string): NodeDisplayConfig {
  return NodeDisplayConfigs[executor] || {
    icon: 'fas fa-cog',
    color: '#6b7280',
    category: NodeCategory.UTILITY
  };
}

export function getCategoryDisplay(category: NodeCategory) {
  return CategoryDisplay[category] || {
    icon: 'fas fa-folder',
    color: '#6b7280'
  };
}
