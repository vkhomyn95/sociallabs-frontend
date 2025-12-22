import type { AuthState } from './types';

export const getters = {
  /**
   * Чи користувач автентифікований
   */
  isAuthenticated: (state): boolean => {
    return !!(state.token && state.user);
  },

  /**
   * Поточний користувач
   */
  currentUser: (state): User | null => {
    return state.user;
  },

  /**
   * Чи йде завантаження
   */
  isLoading: (state): boolean => {
    return state.loading;
  },

  /**
   * Чи є помилка
   */
  hasError: (state): boolean => {
    return !!state.error;
  },

  /**
   * Роль користувача
   */
  userRole: (state): string | null => {
    return state.user?.role || null;
  },

  /**
   * Email користувача
   */
  userEmail: (state): string | null => {
    return state.user?.email || null;
  }
};
