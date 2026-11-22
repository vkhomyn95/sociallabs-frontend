import type { MenuItem, SidebarItem, SlbIconName } from '@sociallabs/frontend-components'

/**
 * Розділи лівого меню. Значення — ключ пункту SlbSidebar і `meta.nav` маршрутів:
 * активний пункт береться з маршруту, тож /workflows/:id теж підсвічує Workflows.
 */
export enum NavSection {
  WORKFLOWS = 'workflows',
  AGENTS = 'agents',
  EXECUTIONS = 'executions',
  DIALOGS = 'dialogs',
  MARKETING_CAMPAIGNS = 'marketing-campaigns',
  MARKETING_SCRAPER = 'marketing-scraper',
  MARKETING_TARGETS = 'marketing-targets',
  MARKETING_LINKS = 'marketing-links',
  STATS_MARKETING = 'stats-marketing',
  STATS_CONVERSATIONS = 'stats-conversations',
  STATS_AUTOMATION = 'stats-automation',
  ACCOUNTS = 'accounts',
  BOTS = 'bots',
  AI_PROVIDERS = 'ai-providers',
  CREDENTIALS = 'credentials',
  NOTIFICATIONS = 'notifications',
}

/** Пункти меню акаунта (наведення на користувача внизу сайдбару). */
export enum AccountAction {
  PROFILE = 'profile',
  DEVELOPERS = 'developers',
  LOGOUT = 'logout',
}

/** Іменовані маршрути, на які веде навігація. */
export enum RouteName {
  WORKFLOW_LIST = 'WorkflowList',
  WORKFLOW_EDITOR = 'WorkflowEditor',
  /** Executions tab of a workflow: one execution on its workflow, read-only. */
  EXECUTION_VIEW = 'ExecutionView',
  AGENTS = 'Agents',
  EXECUTION_LIST = 'ExecutionList',
  DIALOGS = 'Dialogs',
  MARKETING_CAMPAIGNS = 'MarketingCampaigns',
  MARKETING_SCRAPER = 'MarketingScraper',
  MARKETING_TARGETS = 'MarketingTargets',
  MARKETING_LINKS = 'MarketingLinks',
  STATS_MARKETING = 'StatsMarketing',
  STATS_CONVERSATIONS = 'StatsConversations',
  STATS_AUTOMATION = 'StatsAutomation',
  ACCOUNTS = 'Accounts',
  BOTS = 'Bots',
  AI_PROVIDERS = 'AiProviders',
  CREDENTIALS = 'Credentials',
  NOTIFICATIONS = 'Notifications',
  PROFILE = 'Profile',
  DEVELOPERS = 'Developers',
}

interface NavEntry {
  label: string
  icon: SlbIconName
  route: RouteName
}

// Record — новий розділ без пункту меню не скомпілюється.
export const NAV: Record<NavSection, NavEntry> = {
  [NavSection.WORKFLOWS]: { label: 'Workflows', icon: 'dev_nodes', route: RouteName.WORKFLOW_LIST },
  [NavSection.AGENTS]: { label: 'Agents', icon: 'ai_agent', route: RouteName.AGENTS },
  [NavSection.EXECUTIONS]: { label: 'Executions', icon: 'action_history', route: RouteName.EXECUTION_LIST },
  [NavSection.DIALOGS]: { label: 'Dialogs', icon: 'object_comments', route: RouteName.DIALOGS },
  [NavSection.MARKETING_CAMPAIGNS]: { label: 'Campaigns', icon: 'chat_broadcast', route: RouteName.MARKETING_CAMPAIGNS },
  [NavSection.MARKETING_SCRAPER]: { label: 'Scraper', icon: 'action_search', route: RouteName.MARKETING_SCRAPER },
  [NavSection.MARKETING_TARGETS]: { label: 'Targets', icon: 'dev_database', route: RouteName.MARKETING_TARGETS },
  [NavSection.MARKETING_LINKS]: { label: 'Tracking links', icon: 'action_link', route: RouteName.MARKETING_LINKS },
  [NavSection.STATS_MARKETING]: { label: 'Marketing', icon: 'object_chart', route: RouteName.STATS_MARKETING },
  [NavSection.STATS_CONVERSATIONS]: { label: 'Conversations', icon: 'chat_bubble', route: RouteName.STATS_CONVERSATIONS },
  [NavSection.STATS_AUTOMATION]: { label: 'Automation', icon: 'action_bolt', route: RouteName.STATS_AUTOMATION },
  [NavSection.ACCOUNTS]: { label: 'Accounts', icon: 'object_user', route: RouteName.ACCOUNTS },
  [NavSection.BOTS]: { label: 'Bots', icon: 'object_robot', route: RouteName.BOTS },
  [NavSection.AI_PROVIDERS]: { label: 'AI providers', icon: 'ai_sparkles', route: RouteName.AI_PROVIDERS },
  [NavSection.CREDENTIALS]: { label: 'Credentials', icon: 'action_key', route: RouteName.CREDENTIALS },
  [NavSection.NOTIFICATIONS]: { label: 'Notifications', icon: 'object_bell', route: RouteName.NOTIFICATIONS },
}

export const ACCOUNT_ROUTES: Record<Exclude<AccountAction, AccountAction.LOGOUT>, RouteName> = {
  [AccountAction.PROFILE]: RouteName.PROFILE,
  [AccountAction.DEVELOPERS]: RouteName.DEVELOPERS,
}

const item = (section: NavSection): SidebarItem => ({ key: section, label: NAV[section].label, icon: NAV[section].icon })

/**
 * Групи основного меню — вони ж перший рівень breadcrumb у хедері:
 *  - Configure — що налаштовуємо: воркфлоу і AI-агенти;
 *  - Marketing — автоматизоване просування (макет): scraper → база цілей → кампанії → трекінгові посилання;
 *  - Monitor — що відбувається зараз: живі діалоги і запуски;
 *  - Statistics — цифри за період (макет): маркетинг, діалоги, воркфлоу й агенти;
 *  - Connections — через що воркфлоу говорять із зовнішнім світом: особисті акаунти
 *    месенджерів (вхід по QR / коду), боти, AI-провайдери і технічні credentials для нод.
 */
interface NavGroup {
  label: string
  sections: NavSection[]
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Configure', sections: [NavSection.WORKFLOWS, NavSection.AGENTS] },
  {
    label: 'Marketing',
    sections: [
      NavSection.MARKETING_CAMPAIGNS,
      NavSection.MARKETING_SCRAPER,
      NavSection.MARKETING_TARGETS,
      NavSection.MARKETING_LINKS,
    ],
  },
  { label: 'Monitor', sections: [NavSection.DIALOGS, NavSection.EXECUTIONS] },
  {
    label: 'Statistics',
    sections: [NavSection.STATS_MARKETING, NavSection.STATS_CONVERSATIONS, NavSection.STATS_AUTOMATION],
  },
  {
    label: 'Connections',
    sections: [NavSection.ACCOUNTS, NavSection.BOTS, NavSection.AI_PROVIDERS, NavSection.CREDENTIALS],
  },
]

export const NAV_ITEMS: SidebarItem[] = NAV_GROUPS.flatMap((group): SidebarItem[] => [
  { type: 'section', label: group.label },
  ...group.sections.map(item),
])

/**
 * @param section menu section of the current route
 * @returns the menu group containing the section, or null for ungrouped sections
 */
export function navGroupOf(section: NavSection): NavGroup | null {
  return NAV_GROUPS.find((group) => group.sections.includes(section)) ?? null
}

export const NAV_BOTTOM_ITEMS: SidebarItem[] = [item(NavSection.NOTIFICATIONS)]

export const ACCOUNT_MENU: MenuItem[] = [
  { key: AccountAction.PROFILE, label: 'Profile & Billing', icon: 'object_user' },
  { key: AccountAction.DEVELOPERS, label: 'Developers', icon: 'dev_code' },
  { key: 'divider', type: 'divider' },
  { key: AccountAction.LOGOUT, label: 'Log out', icon: 'action_logout', danger: true },
]

const NAV_SECTIONS: ReadonlySet<string> = new Set(Object.values(NavSection))
const ACCOUNT_ACTIONS: ReadonlySet<string> = new Set(Object.values(AccountAction))

export function isNavSection(value: unknown): value is NavSection {
  return typeof value === 'string' && NAV_SECTIONS.has(value)
}

export function isAccountAction(value: unknown): value is AccountAction {
  return typeof value === 'string' && ACCOUNT_ACTIONS.has(value)
}
