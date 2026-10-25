import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { UserRole } from '@/stores/auth/types';

/**
 * Composable для захисту компонент і перевірки прав доступу
 */
export function useAuthGuard() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const currentUser = computed(() => authStore.user);

  /**
   * Перевірка чи користувач має певну роль
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
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
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles);
  };

  /**
   * Перевірка чи користувач має всі зазначені ролі (для складніших систем)
   */
  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!currentUser.value) return false;

    // Для простої системи з однією роллю завжди false якщо більше 1 ролі
    const [only] = roles;
    return roles.length === 1 && only !== undefined && hasRole(only);
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
    role: UserRole | UserRole[],
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
