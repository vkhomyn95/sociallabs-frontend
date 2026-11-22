import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { safeRedirect, useAuthStore } from '@/stores/auth'
import { NavSection, RouteName } from '@/layouts/navigation'
import { CredentialKind } from '@/stores/credential/types'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** За замовчуванням true; успадковується від layout-маршруту. */
    requiresAuth?: boolean
    /** Пункт лівого меню, який підсвічується на цій сторінці. */
    nav?: NavSection
  }
}

// Спільна заглушка для ще не реалізованих розділів меню.
const ComingSoon = () => import('@/views/placeholder/ComingSoon.vue')

// One page component serves all four connection sections; the kind comes via props.
const CredentialsView = () => import('@/views/credentials/CredentialsView.vue')

/**
 * Layout — це батьківський маршрут, сторінки — його children.
 * Поки перша навігація не завершилась (guard чекає /auth/refresh), RouterView
 * нічого не рендерить — тож при перезавантаженні не блимає «чужий» layout.
 */
const routes: RouteRecordRaw[] = [
  // Першим: обидва layout-маршрути теж мають path '/', і без цього '/' зловив би AuthLayout.
  { path: '/', redirect: '/workflows' },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'Auth',
        component: () => import('@/views/auth/Auth.vue'),
        meta: { title: 'Login' },
      },
      {
        path: 'auth/callback',
        name: 'AuthCallback',
        component: () => import('@/views/auth/AuthCallback.vue'),
        meta: { title: 'Signing in' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Повноекранні сторінки з власним тулбаром — без хедера.
      {
        path: 'workflows/:id',
        name: RouteName.WORKFLOW_EDITOR,
        component: () => import('@/features/workflow-editor/WorkflowEditorPage.vue'),
        meta: { title: 'Workflow', nav: NavSection.WORKFLOWS },
      },
      {
        path: 'workflows/:id/executions/:executionId?',
        name: RouteName.EXECUTION_VIEW,
        component: () => import('@/features/executions/ExecutionViewPage.vue'),
        meta: { title: 'Executions', nav: NavSection.WORKFLOWS },
      },
      // Links of the time both editors existed.
      { path: 'workflows/:id/editor', redirect: (to) => `/workflows/${to.params.id}` },
      { path: 'workflow', redirect: '/workflows' },
      {
        path: 'dialogs',
        name: RouteName.DIALOGS,
        component: () => import('@/views/dialogs/DialogsView.vue'),
        meta: { title: 'Dialogs', nav: NavSection.DIALOGS },
      },
      // Звичайні сторінки: хедер із breadcrumb + прокручувана область.
      {
        path: '',
        component: () => import('@/layouts/PageLayout.vue'),
        children: [
          {
            path: 'workflows',
            name: RouteName.WORKFLOW_LIST,
            component: () => import('@/features/workflows/WorkflowListPage.vue'),
            meta: { title: 'Workflows', nav: NavSection.WORKFLOWS },
          },
          {
            path: 'agents',
            name: RouteName.AGENTS,
            component: () => import('@/views/agents/AgentsView.vue'),
            meta: { title: 'Agents', nav: NavSection.AGENTS },
          },
          {
            path: 'executions',
            name: RouteName.EXECUTION_LIST,
            component: () => import('@/features/executions/ExecutionListPage.vue'),
            meta: { title: 'Executions', nav: NavSection.EXECUTIONS },
          },
          // Marketing і Statistics — поки макети на моках (src/views/marketing, src/views/statistics).
          { path: 'marketing', redirect: { name: RouteName.MARKETING_CAMPAIGNS } },
          {
            path: 'marketing/campaigns',
            name: RouteName.MARKETING_CAMPAIGNS,
            component: () => import('@/views/marketing/CampaignsView.vue'),
            meta: { title: 'Campaigns', nav: NavSection.MARKETING_CAMPAIGNS },
          },
          {
            path: 'marketing/scraper',
            name: RouteName.MARKETING_SCRAPER,
            component: () => import('@/views/marketing/ScraperView.vue'),
            meta: { title: 'Scraper', nav: NavSection.MARKETING_SCRAPER },
          },
          {
            path: 'marketing/targets',
            name: RouteName.MARKETING_TARGETS,
            component: () => import('@/views/marketing/TargetsView.vue'),
            meta: { title: 'Targets', nav: NavSection.MARKETING_TARGETS },
          },
          {
            path: 'marketing/links',
            name: RouteName.MARKETING_LINKS,
            component: () => import('@/views/marketing/LinksView.vue'),
            meta: { title: 'Tracking links', nav: NavSection.MARKETING_LINKS },
          },
          // Старий пункт Monitor → Monitoring (заглушка) замінила група Statistics.
          { path: 'monitoring', redirect: { name: RouteName.STATS_MARKETING } },
          { path: 'statistics', redirect: { name: RouteName.STATS_MARKETING } },
          {
            path: 'statistics/marketing',
            name: RouteName.STATS_MARKETING,
            component: () => import('@/views/statistics/MarketingStatsView.vue'),
            meta: { title: 'Marketing', nav: NavSection.STATS_MARKETING },
          },
          {
            path: 'statistics/conversations',
            name: RouteName.STATS_CONVERSATIONS,
            component: () => import('@/views/statistics/ConversationsStatsView.vue'),
            meta: { title: 'Conversations', nav: NavSection.STATS_CONVERSATIONS },
          },
          {
            path: 'statistics/automation',
            name: RouteName.STATS_AUTOMATION,
            component: () => import('@/views/statistics/AutomationStatsView.vue'),
            meta: { title: 'Automation', nav: NavSection.STATS_AUTOMATION },
          },
          {
            path: 'connections/accounts',
            name: RouteName.ACCOUNTS,
            component: CredentialsView,
            props: { kind: CredentialKind.ACCOUNT },
            meta: { title: 'Accounts', nav: NavSection.ACCOUNTS },
          },
          {
            path: 'connections/bots',
            name: RouteName.BOTS,
            component: CredentialsView,
            props: { kind: CredentialKind.BOT },
            meta: { title: 'Bots', nav: NavSection.BOTS },
          },
          {
            path: 'connections/ai',
            name: RouteName.AI_PROVIDERS,
            component: CredentialsView,
            props: { kind: CredentialKind.AI_PROVIDER },
            meta: { title: 'AI providers', nav: NavSection.AI_PROVIDERS },
          },
          {
            path: 'connections/credentials',
            name: RouteName.CREDENTIALS,
            component: CredentialsView,
            props: { kind: CredentialKind.GENERIC },
            meta: { title: 'Credentials', nav: NavSection.CREDENTIALS },
          },
          {
            path: 'profile',
            name: RouteName.PROFILE,
            component: () => import('@/views/profile/Profile.vue'),
            meta: { title: 'Profile & Billing' },
          },
          {
            path: 'developers',
            name: RouteName.DEVELOPERS,
            component: ComingSoon,
            meta: { title: 'Developers' },
          },
          {
            path: 'notifications',
            name: RouteName.NOTIFICATIONS,
            component: () => import('@/views/notification/NotificationList.vue'),
            meta: { title: 'Notifications', nav: NavSection.NOTIFICATIONS },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Перший перехід: тихо відновлюємо сесію з refresh-cookie.
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  document.title = to.meta.title ? `${to.meta.title} · SocialLabs` : 'SocialLabs'

  // meta зливається від батька до дитини, тож requiresAuth приходить з layout-маршруту.
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    return { name: 'Auth', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Auth' && authStore.isAuthenticated) {
    return safeRedirect(to.query.redirect)
  }
})

router.afterEach((to, from, failure) => {
  if (failure) console.error('Navigation failed:', failure)
})

export default router
