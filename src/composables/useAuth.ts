import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Тонка обгортка над auth store для компонентів, яким потрібні поточний
 * користувач і вихід із редіректом. Кроки входу живуть у store / views/auth.
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.user)

  const logout = async (redirectTo = '/login'): Promise<void> => {
    await authStore.logout()
    await router.push(redirectTo)
  }

  return {
    isAuthenticated,
    currentUser,
    logout,
  }
}
