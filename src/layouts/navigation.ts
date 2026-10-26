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
  MONITORING = 'monitoring',
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
  /** New document-based editor (migration step 10); the legacy one stays at /workflows/:id until step 12. */
  WORKFLOW_EDITOR = 'WorkflowEditor',
  AGENTS = 'Agents',
  EXECUTION_LIST = 'ExecutionList',
  DIALOGS = 'Dialogs',
  MONITORING = 'Monitoring',
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
  [NavSection.MONITORING]: { label: 'Monitoring', icon: 'object_chart', route: RouteName.MONITORING },
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
 *  - Monitor — що відбувається: живі діалоги, запуски, статистика;
 *  - Connections — через що воркфлоу говорять із зовнішнім світом: особисті акаунти
 *    месенджерів (вхід по QR / коду), боти, AI-провайдери і технічні credentials для нод.
 */
interface NavGroup {
  label: string
  sections: NavSection[]
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Configure', sections: [NavSection.WORKFLOWS, NavSection.AGENTS] },
  { label: 'Monitor', sections: [NavSection.DIALOGS, NavSection.EXECUTIONS, NavSection.MONITORING] },
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
