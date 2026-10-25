import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'

/**
 * Агент — збережена конфігурація AI Agent ноди (stores/node/definitions/ai-agent.ts),
 * яку можна перевикористати у воркфлоу і підключити до акаунтів як «того, хто веде діалог».
 * Окремої сутності на бекенді ще немає — поки що макет на моках (agents.mock.ts).
 */

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DRAFT = 'DRAFT',
}

export enum AiProvider {
  ANTHROPIC = 'ANTHROPIC',
  OPENAI = 'OPENAI',
  GOOGLE = 'GOOGLE',
}

/** Збігається з outputMode AI Agent ноди. */
export enum AgentOutputMode {
  ANSWER_ONLY = 'ANSWER_ONLY',
  WITH_STEPS = 'WITH_STEPS',
  STRUCTURED = 'STRUCTURED',
}

export enum AgentToolKind {
  WORKFLOW = 'WORKFLOW',
  KNOWLEDGE = 'KNOWLEDGE',
  HTTP = 'HTTP',
}

/** Вкладки редактора агента. */
export enum AgentEditorTab {
  INSTRUCTIONS = 'instructions',
  MODEL = 'model',
  TOOLS = 'tools',
  CHANNELS = 'channels',
  GUARDRAILS = 'guardrails',
}

/** Дії з меню «⋯» картки агента. */
export enum AgentCardAction {
  EDIT = 'edit',
  TOGGLE = 'toggle',
  DUPLICATE = 'duplicate',
  DELETE = 'delete',
}

const CARD_ACTIONS: ReadonlySet<string> = new Set(Object.values(AgentCardAction))

export function isAgentCardAction(value: unknown): value is AgentCardAction {
  return typeof value === 'string' && CARD_ACTIONS.has(value)
}

export interface AgentTool {
  id: string
  name: string
  description: string
  kind: AgentToolKind
}

/** Ліміти ReAct-циклу — ті самі параметри, що й у ноди. */
export interface AgentLimits {
  maxIterations: number
  maxToolCalls: number
  timeoutMs: number
}

/** Коли агент передає діалог оператору. */
export interface AgentHandoff {
  onRequest: boolean
  onNegativeSentiment: boolean
  onToolFailure: boolean
  keywords: string[]
}

export interface AgentStats {
  conversations7d: number
  /** Частка діалогів, закритих без оператора, %. */
  resolvedRate: number
  /** Частка діалогів, переданих оператору, %. */
  handoffRate: number
}

export interface Agent {
  id: string
  name: string
  description: string
  icon: SlbIconName
  color: BadgeColor
  status: AgentStatus
  provider: AiProvider
  model: string
  temperature: number
  systemPrompt: string
  outputMode: AgentOutputMode
  toolIds: string[]
  /** Акаунти (dialogs.mock ACCOUNTS), у яких агент веде діалоги. */
  accountIds: string[]
  limits: AgentLimits
  handoff: AgentHandoff
  stats: AgentStats
  updatedAt: string
}

/** Фільтр списку: усі агенти або конкретний статус. */
export const ALL_STATUSES = 'ALL'
export type AgentStatusFilter = AgentStatus | typeof ALL_STATUSES

const PROVIDERS: ReadonlySet<string> = new Set(Object.values(AiProvider))
const OUTPUT_MODES: ReadonlySet<string> = new Set(Object.values(AgentOutputMode))

export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === 'string' && PROVIDERS.has(value)
}

export function isAgentOutputMode(value: unknown): value is AgentOutputMode {
  return typeof value === 'string' && OUTPUT_MODES.has(value)
}
