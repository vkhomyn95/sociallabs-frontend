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
        path: 'workflow',
        name: 'WorkflowCreate',
        component: () => import('@/views/workflow/WorkflowView.vue'),
        meta: { title: 'Workflow', nav: NavSection.WORKFLOWS },
      },
      {
        path: 'workflows/:id',
        name: 'WorkflowEdit',
        component: () => import('@/views/workflow/WorkflowView.vue'),
        meta: { title: 'Workflow', nav: NavSection.WORKFLOWS },
      },
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
            component: () => import('@/views/workflow/WorkflowList.vue'),
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
            component: () => import('@/views/execution/ExecutionList.vue'),
            meta: { title: 'Executions', nav: NavSection.EXECUTIONS },
          },
          {
            path: 'monitoring',
            name: RouteName.MONITORING,
            component: ComingSoon,
            meta: { title: 'Monitoring', nav: NavSection.MONITORING },
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
