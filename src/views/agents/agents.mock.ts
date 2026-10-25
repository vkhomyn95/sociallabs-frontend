import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'
import { AgentEditorTab, AgentOutputMode, AgentStatus, AgentToolKind, AiProvider } from './agents.types'
import type { Agent, AgentTool } from './agents.types'

// ── Довідники для відображення (Record — новий член enum без запису не скомпілюється) ──

export const STATUS_META: Record<AgentStatus, { label: string; color: BadgeColor }> = {
  [AgentStatus.ACTIVE]: { label: 'Active', color: 'success' },
  [AgentStatus.PAUSED]: { label: 'Paused', color: 'warning' },
  [AgentStatus.DRAFT]: { label: 'Draft', color: 'gray' },
}

export const PROVIDER_META: Record<AiProvider, { label: string; icon: SlbIconName; models: string[] }> = {
  [AiProvider.ANTHROPIC]: {
    label: 'Anthropic',
    icon: 'ai_sparkle',
    models: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'],
  },
  [AiProvider.OPENAI]: { label: 'OpenAI', icon: 'ai_sparkles', models: ['gpt-4o', 'gpt-4o-mini', 'o1'] },
  [AiProvider.GOOGLE]: { label: 'Google', icon: 'brand_google', models: ['gemini-2.5-pro', 'gemini-2.5-flash'] },
}

export const OUTPUT_MODE_LABEL: Record<AgentOutputMode, string> = {
  [AgentOutputMode.ANSWER_ONLY]: 'Answer only',
  [AgentOutputMode.WITH_STEPS]: 'With steps (debug)',
  [AgentOutputMode.STRUCTURED]: 'Structured JSON',
}

export const TOOL_KIND_META: Record<AgentToolKind, { label: string; icon: SlbIconName }> = {
  [AgentToolKind.WORKFLOW]: { label: 'Workflow', icon: 'dev_nodes' },
  [AgentToolKind.KNOWLEDGE]: { label: 'Knowledge', icon: 'ai_knowledge' },
  [AgentToolKind.HTTP]: { label: 'HTTP', icon: 'object_globe' },
}

export const EDITOR_TABS: Record<AgentEditorTab, { label: string; icon: SlbIconName }> = {
  [AgentEditorTab.INSTRUCTIONS]: { label: 'Instructions', icon: 'ai_prompt' },
  [AgentEditorTab.MODEL]: { label: 'Model', icon: 'ai_sparkles' },
  [AgentEditorTab.TOOLS]: { label: 'Tools', icon: 'action_wrench' },
  [AgentEditorTab.CHANNELS]: { label: 'Channels', icon: 'object_comments' },
  [AgentEditorTab.GUARDRAILS]: { label: 'Guardrails', icon: 'object_shield' },
}

export const AGENT_ICONS: SlbIconName[] = ['ai_agent', 'object_robot', 'ai_bot_message', 'object_brain', 'chat_operator', 'object_users']
export const AGENT_COLORS: BadgeColor[] = ['violet', 'blue', 'cyan', 'success', 'orange', 'pink']

// ── Дані ──────────────────────────────────────────────────────────────

export const TOOLS: AgentTool[] = [
  { id: 'wf-order-status', name: 'Статус замовлення', description: 'Шукає замовлення за номером або телефоном', kind: AgentToolKind.WORKFLOW },
  { id: 'wf-lead', name: 'Кваліфікація лідів', description: 'Записує ліда в CRM і ставить задачу менеджеру', kind: AgentToolKind.WORKFLOW },
  { id: 'wf-payment', name: 'Нагадування про оплату', description: 'Надсилає посилання на оплату рахунку', kind: AgentToolKind.WORKFLOW },
  { id: 'kb-faq', name: 'FAQ магазину', description: 'Доставка, повернення, гарантія — 48 статей', kind: AgentToolKind.KNOWLEDGE },
  { id: 'kb-vacancies', name: 'Вакансії', description: 'Відкриті позиції та вимоги', kind: AgentToolKind.KNOWLEDGE },
  { id: 'http-np', name: 'Нова пошта: трекінг', description: 'GET api.novaposhta.ua — статус ТТН', kind: AgentToolKind.HTTP },
]

const DEFAULT_LIMITS = { maxIterations: 8, maxToolCalls: 12, timeoutMs: 30_000 }

export const AGENTS: Agent[] = [
  {
    id: 'a-sales',
    name: 'Менеджер продажів',
    description: 'Консультує по товарах, збирає контакти і передає гарячих лідів менеджеру.',
    icon: 'ai_agent',
    color: 'violet',
    status: AgentStatus.ACTIVE,
    provider: AiProvider.ANTHROPIC,
    model: 'claude-sonnet-5-5',
    temperature: 0.4,
    systemPrompt:
      'Ти — менеджер продажів магазину SocialLabs Shop. Відповідай коротко і дружньо, українською.\n' +
      'Уточни потребу клієнта, запропонуй 1–2 товари. Якщо клієнт готовий купити — збери імʼя й телефон ' +
      'і виклич інструмент «Кваліфікація лідів».',
    outputMode: AgentOutputMode.ANSWER_ONLY,
    toolIds: ['wf-lead', 'kb-faq'],
    accountIds: ['viber-shop', 'tg-bot'],
    limits: { ...DEFAULT_LIMITS },
    handoff: { onRequest: true, onNegativeSentiment: true, onToolFailure: false, keywords: ['оптом', 'знижка'] },
    stats: { conversations7d: 342, resolvedRate: 71, handoffRate: 18 },
    updatedAt: '2 hours ago',
  },
  {
    id: 'a-support',
    name: 'Підтримка L1',
    description: 'Відповідає на питання про доставку, повернення і статус замовлення.',
    icon: 'chat_operator',
    color: 'blue',
    status: AgentStatus.ACTIVE,
    provider: AiProvider.ANTHROPIC,
    model: 'claude-haiku-5-5',
    temperature: 0.2,
    systemPrompt:
      'Ти — перша лінія підтримки. Спершу шукай відповідь у FAQ. Статус замовлення перевіряй інструментом, ' +
      'не вигадуй. Якщо питання не про замовлення чи доставку — передай оператору.',
    outputMode: AgentOutputMode.ANSWER_ONLY,
    toolIds: ['wf-order-status', 'kb-faq', 'http-np'],
    accountIds: ['tg-bot', 'viber-shop', 'viber-me'],
    limits: { ...DEFAULT_LIMITS, maxToolCalls: 6 },
    handoff: { onRequest: true, onNegativeSentiment: true, onToolFailure: true, keywords: ['скарга', 'юрист'] },
    stats: { conversations7d: 1204, resolvedRate: 84, handoffRate: 9 },
    updatedAt: 'Yesterday',
  },
  {
    id: 'a-recruiter',
    name: 'Рекрутер',
    description: 'Проводить первинну співбесіду з кандидатами у Telegram.',
    icon: 'object_users',
    color: 'cyan',
    status: AgentStatus.PAUSED,
    provider: AiProvider.OPENAI,
    model: 'gpt-4o',
    temperature: 0.6,
    systemPrompt:
      'Ти — рекрутер. Розкажи про відкриті вакансії, постав кандидату 3–5 питань про досвід ' +
      'і підсумуй відповіді структуровано.',
    outputMode: AgentOutputMode.STRUCTURED,
    toolIds: ['kb-vacancies'],
    accountIds: ['tg-me'],
    limits: { ...DEFAULT_LIMITS },
    handoff: { onRequest: true, onNegativeSentiment: false, onToolFailure: false, keywords: [] },
    stats: { conversations7d: 37, resolvedRate: 62, handoffRate: 24 },
    updatedAt: '5 days ago',
  },
  {
    id: 'a-billing',
    name: 'Нагадування про оплату',
    description: 'Ввічливо нагадує про неоплачені рахунки і відповідає на питання щодо оплати.',
    icon: 'object_card',
    color: 'orange',
    status: AgentStatus.DRAFT,
    provider: AiProvider.GOOGLE,
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    systemPrompt: '',
    outputMode: AgentOutputMode.ANSWER_ONLY,
    toolIds: ['wf-payment'],
    accountIds: [],
    limits: { ...DEFAULT_LIMITS },
    handoff: { onRequest: true, onNegativeSentiment: true, onToolFailure: true, keywords: [] },
    stats: { conversations7d: 0, resolvedRate: 0, handoffRate: 0 },
    updatedAt: 'Just now',
  },
]

export const toolById = (id: string): AgentTool | undefined => TOOLS.find((t) => t.id === id)

let seq = 0

/** Унікальний id для нового агента (чернетка, копія). */
export function nextAgentId(): string {
  seq += 1
  return `a-new-${seq}`
}

/** Чернетка нового агента з налаштуваннями за замовчуванням (як у AI Agent ноди). */
export function createDraftAgent(): Agent {
  const id = nextAgentId()
  return {
    id,
    name: 'New agent',
    description: '',
    icon: AGENT_ICONS[seq % AGENT_ICONS.length]!,
    color: AGENT_COLORS[seq % AGENT_COLORS.length]!,
    status: AgentStatus.DRAFT,
    provider: AiProvider.ANTHROPIC,
    model: 'claude-sonnet-5-5',
    temperature: 0.4,
    systemPrompt: 'You are a helpful assistant.',
    outputMode: AgentOutputMode.ANSWER_ONLY,
    toolIds: [],
    accountIds: [],
    limits: { ...DEFAULT_LIMITS },
    handoff: { onRequest: true, onNegativeSentiment: true, onToolFailure: true, keywords: [] },
    stats: { conversations7d: 0, resolvedRate: 0, handoffRate: 0 },
    updatedAt: 'Just now',
  }
}
