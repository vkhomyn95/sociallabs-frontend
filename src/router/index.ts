import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LayoutType } from '@/layouts/layout.types'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Auth',
    component: () => import('@/views/auth/Auth.vue'),
    meta: {
      title: 'Login',
      layout: LayoutType.Auth,
      requiresAuth: false,
    }
  },
  {
    path: '/',
    redirect: '/workflows'
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: () => import('@/views/workflow/WorkflowList.vue'),
    meta: {
      title: 'Workflows',
      layout: LayoutType.App,
      requiresAuth: true,
    }
  },
  {
    path: '/workflow',
    name: 'WorkflowCreate',
    component: () => import('@/views/workflow/WorkflowView.vue'),
    meta: {
      title: 'Workflow',
      layout: LayoutType.App,
      requiresAuth: true,
    }
  },
  {
    path: '/workflows/:id',
    name: 'WorkflowEdit',
    component: () => import('@/views/workflow/WorkflowView.vue'),
    meta: {
      title: 'Workflow',
      layout: LayoutType.App,
      requiresAuth: true,
    }
  },
  {
    path: '/executions',
    name: 'ExecutionList',
    component: () => import('@/views/execution/ExecutionList.vue'),
    meta: {
      title: 'Executions',
      layout: LayoutType.App,
      requiresAuth: true,
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: {
      title: 'Profile & Billing',
      layout: LayoutType.App,
      requiresAuth: true,
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/notification/NotificationList.vue'),
    meta: {
      title: 'Notifications',
      layout: LayoutType.App,
      requiresAuth: true,
    }
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  document.title = (to.meta.title as string) || 'SocialLabs'

  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

router.afterEach((to, from, failure) => {
  if (failure) console.error('Navigation failed:', failure)
})

export default router
