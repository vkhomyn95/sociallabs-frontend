import type { TabItem } from '@sociallabs/frontend-components'
import type { BarListItem } from '@/components/stats/BarList.vue'
import type { ColumnPoint } from '@/components/stats/ColumnChart.vue'

// Моки для сторінок Statistics. Цифри узгоджені з marketing.mock.ts лише приблизно — це макет.

export enum Period {
  DAY = '24h',
  WEEK = '7d',
  MONTH = '30d',
}

export const PERIOD_TABS: TabItem[] = [
  { key: Period.DAY, label: '24 hours' },
  { key: Period.WEEK, label: '7 days' },
  { key: Period.MONTH, label: '30 days' },
]

export const isPeriod = (v: string): v is Period => (Object.values(Period) as string[]).includes(v)

/** Множник, яким «масштабуються» тижневі моки під обраний період. */
export const PERIOD_SCALE: Record<Period, number> = { [Period.DAY]: 1 / 7, [Period.WEEK]: 1, [Period.MONTH]: 4.3 }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Детермінований «шум», щоб графіки не стрибали між рендерами. */
function series(length: number, base: number, spread: number, seed: number, label: (i: number) => string): ColumnPoint[] {
  return Array.from({ length }, (_, i) => ({
    label: label(i),
    value: Math.round(base + spread * Math.sin(i * 1.7 + seed) + spread * 0.5 * Math.cos(i * 0.9 + seed * 2)),
  }))
}

export function timeline(period: Period, base: number, spread: number, seed: number): ColumnPoint[] {
  if (period === Period.DAY) return series(24, base / 24, spread / 24, seed, (i) => `${String(i).padStart(2, '0')}:00`)
  if (period === Period.WEEK) return series(7, base, spread, seed, (i) => DAYS[i] ?? '')
  return series(30, base, spread, seed, (i) => `Nov ${i + 1}`)
}

// ── Marketing ──

export const MARKETING_TOTALS = {
  targetsScraped: 4_438,
  comments: 3_133,
  posts: 318,
  messagesSent: 1_204,
  clicks: 2_530,
  leads: 209,
  blocks: 37,
  deliveryRate: 92.4,
}

export const MARKETING_FUNNEL = [
  { label: 'Targets scraped', value: 4_438 },
  { label: 'Approved', value: 2_786 },
  { label: 'Reached', value: 2_451 },
  { label: 'Actions done', value: 4_655 },
  { label: 'Clicks / joins', value: 2_530 },
  { label: 'Leads', value: 209 },
]

export const LEADS_BY_CHANNEL: BarListItem[] = [
  { label: '@crypto_news_ua', value: 31, icon: 'brand_telegram', note: '6.1% CR' },
  { label: '@marketing_ua_chat', value: 29, icon: 'brand_telegram', note: '7.2% CR' },
  { label: '@trading_room', value: 24, icon: 'brand_telegram', note: '8.3% CR' },
  { label: 'TikTok #smm', value: 21, icon: 'brand_tiktok', note: '6.2% CR' },
  { label: 'Webinar DM', value: 38, icon: 'brand_telegram', note: '18.1% CR' },
  { label: '@smm_hub_chat', value: 3, icon: 'brand_telegram', note: 'blocked' },
]

export const ACTIONS_BY_TYPE: BarListItem[] = [
  { label: 'Comments', value: 3_133, icon: 'chat_bubble_text' },
  { label: 'Messages', value: 1_204, icon: 'action_send' },
  { label: 'Ad posts', value: 318, icon: 'chat_broadcast' },
  { label: 'Reactions', value: 0, icon: 'chat_thumbs_up' },
]

export const BLOCKS_BY_REASON: BarListItem[] = [
  { label: 'Comment deleted by admin', value: 14, icon: 'action_trash' },
  { label: 'Banned in chat', value: 9, icon: 'object_lock' },
  { label: 'FLOOD_WAIT / rate limit', value: 8, icon: 'object_clock' },
  { label: 'Spam block on account', value: 4, icon: 'status_error' },
  { label: 'Privacy: DMs closed', value: 2, icon: 'visibility_off' },
]

export const CAMPAIGN_EFFICIENCY = [
  { id: 'c1', name: 'AI comments · crypto channels', actions: 2_431, clicks: 1_120, leads: 96, blocks: 7 },
  { id: 'c2', name: 'Weekly ad post · marketing chats', actions: 318, clicks: 860, leads: 54, blocks: 3 },
  { id: 'c3', name: 'Welcome DM · webinar members', actions: 1_204, clicks: 210, leads: 38, blocks: 22 },
  { id: 'c4', name: '#smm comments under trending videos', actions: 702, clicks: 340, leads: 21, blocks: 5 },
]

export const ACCOUNT_HEALTH = [
  { account: '@vkhomyn', platform: 'Telegram', actions: 1_820, state: 'ok', note: '' },
  { account: '@growth_acc_2', platform: 'Telegram', actions: 1_410, state: 'limited', note: 'FLOOD_WAIT until 14:30' },
  { account: '@growth_acc_3', platform: 'Telegram', actions: 960, state: 'spam', note: 'Spam block · 3 days' },
  { account: 'sociallabs.tt', platform: 'TikTok', actions: 702, state: 'ok', note: '' },
]

// ── Conversations ──

export const CONVERSATION_TOTALS = {
  dialogs: 1_284,
  newContacts: 412,
  messagesIn: 9_870,
  messagesOut: 11_420,
  firstResponseSec: 38,
  resolvedByAi: 71,
  handoff: 18,
  unanswered: 23,
}

export const DIALOGS_BY_CHANNEL: BarListItem[] = [
  { label: 'Telegram', value: 684, icon: 'brand_telegram' },
  { label: 'Viber', value: 341, icon: 'brand_viber' },
  { label: 'WhatsApp', value: 196, icon: 'brand_whatsapp' },
  { label: 'TikTok', value: 41, icon: 'brand_tiktok' },
  { label: 'XChat', value: 22, icon: 'brand_x' },
]

export const DIALOGS_BY_HANDLER: BarListItem[] = [
  { label: 'AI agent', value: 912, icon: 'ai_sparkle', note: '71%' },
  { label: 'Workflow', value: 141, icon: 'dev_nodes', note: '11%' },
  { label: 'Operator', value: 231, icon: 'chat_operator', note: '18%' },
]

export const HANDOFF_REASONS: BarListItem[] = [
  { label: 'Asked for a human', value: 96 },
  { label: 'Negative sentiment', value: 61 },
  { label: 'Tool failed', value: 28 },
  { label: 'Out of instructions', value: 46 },
]

// ── Automation (workflows + agents) ──

export const AUTOMATION_TOTALS = {
  executions: 18_430,
  successRate: 97.2,
  failed: 516,
  avgDurationMs: 1_840,
  agentRuns: 6_210,
  tokens: 14_800_000,
  aiCost: 41.6,
}

export const WORKFLOW_STATS = [
  { id: 'w1', name: 'Кваліфікація лідів', runs: 6_120, success: 98.9, avgMs: 2_100, lastError: '' },
  { id: 'w2', name: 'Ad post rotation', runs: 318, success: 96.2, avgMs: 4_400, lastError: 'CHAT_WRITE_FORBIDDEN' },
  { id: 'w3', name: 'Broadcast with follow-up', runs: 1_204, success: 91.4, avgMs: 1_300, lastError: 'PEER_FLOOD' },
  { id: 'w4', name: 'Підтримка FAQ', runs: 7_880, success: 99.4, avgMs: 900, lastError: '' },
  { id: 'w5', name: 'Статус замовлення', runs: 2_908, success: 97.8, avgMs: 1_600, lastError: 'HTTP 502 from CRM' },
]

export const AGENT_STATS = [
  { id: 'a1', name: 'Менеджер продажів', model: 'claude-sonnet-5-5', runs: 2_340, resolved: 74, tokens: 6_100_000, cost: 18.3 },
  { id: 'a2', name: 'Підтримка L1', model: 'claude-haiku-5-5', runs: 2_180, resolved: 82, tokens: 3_900_000, cost: 3.9 },
  { id: 'a3', name: 'Коментатор (Sonnet)', model: 'claude-sonnet-5-5', runs: 1_690, resolved: 0, tokens: 4_800_000, cost: 19.4 },
]

export const ERRORS_BY_NODE: BarListItem[] = [
  { label: 'Telegram · Send message', value: 212, icon: 'brand_telegram' },
  { label: 'HTTP Request', value: 141, icon: 'object_globe' },
  { label: 'AI Agent', value: 84, icon: 'ai_agent' },
  { label: 'TikTok · Comment', value: 52, icon: 'brand_tiktok' },
  { label: 'Code', value: 27, icon: 'dev_code' },
]
