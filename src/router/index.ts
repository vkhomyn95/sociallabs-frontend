import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth'

// Route definitions
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Auth',
    component: () => import('@/views/Auth.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false,
      redirectIfAuthenticated: true
    }
  },
  {
    path: '/',
    redirect: '/workflows'
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: () => import('@/views/WorkflowList.vue'),
    meta: {
      title: 'Workflows',
      requiresAuth: true
    }
  },
  {
    path: '/workflow',
    name: 'WorkflowCreate',
    component: () => import('@/views/WorkflowView.vue'),
    meta: {
      title: 'Workflow',
      requiresAuth: true
    }
  },
  {
    path: '/workflows/:id',
    name: 'WorkflowEdit',
    component: () => import('@/views/WorkflowView.vue'),
    meta: {
      title: 'Workflow',
      requiresAuth: true
    }
  },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('@/views/NotFound.vue'),
  //   meta: {
  //     title: '404 - Not Found',
  //     requiresAuth: false
  //   }
  // }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// Global before guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Ініціалізуємо store при першому переході
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  // Встановлюємо title сторінки
  const title = to.meta.title as string || 'SocialLabs';
  document.title = title;

  // Перевіряємо чи потрібна автентифікація
  const requiresAuth = to.meta.requiresAuth !== false;
  const redirectIfAuthenticated = to.meta.redirectIfAuthenticated === true;

  if (requiresAuth && !authStore.isAuthenticated) {
    // Редірект на логін якщо потрібна автентифікація
    next({
      name: 'Auth',
      query: { redirect: to.fullPath }
    });
  } else if (redirectIfAuthenticated && authStore.isAuthenticated) {
    // Редірект на головну якщо вже автентифікований
    const redirect = (to.query.redirect as string) || '/workflows';
    next(redirect);
  } else {
    // Дозволяємо перехід
    next();
  }
});

// Global after hook для обробки помилок
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('Navigation failed:', failure);
  }
});

export default router;
