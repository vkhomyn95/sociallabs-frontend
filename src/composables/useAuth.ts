import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, RegisterData, ValidationErrors } from '@/stores/auth/types';

/**
 * Composable для роботи з автентифікацією
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  // Реактивні дані
  const loginErrors = ref<ValidationErrors>({});
  const registerErrors = ref<ValidationErrors>({});

  // Computed властивості
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const currentUser = computed(() => authStore.currentUser);
  const isLoading = computed(() => authStore.isLoading);
  const error = computed(() => authStore.error);

  /**
   * Валідація email
   */
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }

    return null;
  };

  /**
   * Валідація пароля
   */
  const validatePassword = (password: string, minLength = 6): string | null => {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }

    return null;
  };

  /**
   * Валідація імені
   */
  const validateName = (name: string): string | null => {
    if (!name) {
      return 'Name is required';
    }

    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }

    return null;
  };

  /**
   * Валідація форми логіну
   */
  const validateLoginForm = (credentials: LoginCredentials): boolean => {
    loginErrors.value = {};
    let isValid = true;

    const emailError = validateEmail(credentials.email);
    if (emailError) {
      loginErrors.value.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(credentials.password);
    if (passwordError) {
      loginErrors.value.password = passwordError;
      isValid = false;
    }

    return isValid;
  };

  /**
   * Валідація форми реєстрації
   */
  const validateRegisterForm = (
    data: RegisterData & { confirmPassword?: string }
  ): boolean => {
    registerErrors.value = {};
    let isValid = true;

    const nameError = validateName(data.firstName);
    if (nameError) {
      registerErrors.value.firstName = nameError;
      isValid = false;
    }

    const emailError = validateEmail(data.email);
    if (emailError) {
      registerErrors.value.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(data.password, 8);
    if (passwordError) {
      registerErrors.value.password = passwordError;
      isValid = false;
    }

    if (data.confirmPassword !== undefined) {
      if (!data.confirmPassword) {
        registerErrors.value.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (data.password !== data.confirmPassword) {
        registerErrors.value.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    return isValid;
  };

  /**
   * Вхід користувача
   */
  const login = async (
    credentials: LoginCredentials,
    redirectTo = '/'
  ): Promise<boolean> => {
    if (!validateLoginForm(credentials)) {
      return false;
    }

    const success = await authStore.login(credentials);

    if (success) {
      await router.push(redirectTo);
    }

    return success;
  };

  /**
   * Реєстрація користувача
   */
  const register = async (
    data: RegisterData,
    redirectTo = '/'
  ): Promise<boolean> => {
    if (!validateRegisterForm(data)) {
      return false;
    }

    const success = await authStore.register(data);

    if (success) {
      await router.push(redirectTo);
    }

    return success;
  };

  /**
   * Вихід користувача
   */
  const logout = async (redirectTo = '/login'): Promise<void> => {
    await authStore.logout();
    await router.push(redirectTo);
  };

  /**
   * Очищення помилок
   */
  const clearErrors = (): void => {
    loginErrors.value = {};
    registerErrors.value = {};
    authStore.clearError();
  };

  /**
   * Ініціалізація автентифікації
   */
  const initialize = async (): Promise<void> => {
    await authStore.initialize();
  };

  return {
    // State
    isAuthenticated,
    currentUser,
    isLoading,
    error,
    loginErrors,
    registerErrors,

    // Actions
    login,
    register,
    logout,
    clearErrors,
    initialize,

    // Validators
    validateEmail,
    validatePassword,
    validateName,
    validateLoginForm,
    validateRegisterForm
  };
}
