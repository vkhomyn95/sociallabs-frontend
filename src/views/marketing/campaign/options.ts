import type { SelectOption } from '@sociallabs/frontend-components'
import { PLATFORM_META } from '../marketing.mock'
import { Platform } from '../marketing.types'

// Спільні варіанти селектів для drawer-ів кампаній (моки).

/** Куди йде відповідь людини на коментар / повідомлення. */
export const REPLY_OPTIONS: SelectOption[] = [
  { value: 'agent', label: 'Hand to AI agent «Менеджер продажів»', icon: 'ai_agent' },
  { value: 'workflow', label: 'Start workflow «Кваліфікація лідів»', icon: 'dev_nodes' },
  { value: 'operator', label: 'Leave for an operator in Dialogs', icon: 'chat_operator' },
]

export const AGENT_OPTIONS: SelectOption[] = [
  { value: 'commenter', label: 'Коментатор (Sonnet)', icon: 'ai_agent', description: 'claude-sonnet-5-5' },
  { value: 'tt-commenter', label: 'TikTok commenter', icon: 'ai_agent', description: 'claude-haiku-5-5' },
]

export const TARGET_LIST_OPTIONS: SelectOption[] = [
  { value: 'crypto', label: 'Crypto UA · comments open', description: '184 approved targets' },
  { value: 'marketing', label: 'Marketing groups · posting allowed', description: '42 approved targets' },
  { value: 'tt-smm', label: '#smm #marketingtips · last 24h', description: 'refreshed by the scraper every 2 h' },
]

export const PLATFORM_OPTIONS: SelectOption[] = [Platform.TELEGRAM, Platform.TIKTOK, Platform.INSTAGRAM].map((p) => ({
  value: p,
  label: PLATFORM_META[p].label,
  icon: PLATFORM_META[p].icon,
}))
