import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth/auth.store';

/**
 * Composable для захисту компонент і перевірки прав доступу
 */
export function useAuthGuard() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const currentUser = computed(() => authStore.currentUser);

  /**
   * Перевірка чи користувач має певну роль
   */
  const hasRole = (role: string | string[]): boolean => {
    if (!currentUser.value) return false;

    const userRole = currentUser.value.role;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }

    return userRole === role;
  };

  /**
   * Перевірка чи користувач має хоча б одну з ролей
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return hasRole(roles);
  };

  /**
   * Перевірка чи користувач має всі зазначені ролі (для складніших систем)
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!currentUser.value) return false;

    // Для простої системи з однією роллю завжди false якщо більше 1 ролі
    return roles.length === 1 && hasRole(roles[0]);
  };

  /**
   * Редірект на логін якщо не автентифікований
   */
  const requireAuth = (redirectTo = '/login'): void => {
    if (!isAuthenticated.value) {
      router.push({
        path: redirectTo,
        query: { redirect: router.currentRoute.value.fullPath }
      });
    }
  };

  /**
   * Редірект на головну якщо вже автентифікований
   */
  const redirectIfAuthenticated = (redirectTo = '/'): void => {
    if (isAuthenticated.value) {
      router.push(redirectTo);
    }
  };

  /**
   * Перевірка доступу і редірект
   */
  const requireRole = (
    role: string | string[],
    redirectTo = '/unauthorized'
  ): void => {
    if (!isAuthenticated.value) {
      requireAuth();
      return;
    }

    if (!hasRole(role)) {
      router.push(redirectTo);
    }
  };

  return {
    isAuthenticated,
    currentUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    requireAuth,
    redirectIfAuthenticated,
    requireRole
  };
}
