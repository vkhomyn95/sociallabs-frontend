import type { LoginCredentials, RegisterData } from './types'
import { AuthService } from '@/stores/auth/service.ts'

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const actions = {
  /**
   * Вхід користувача
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const response = await AuthService.login(credentials);

      this.setAuthData(response.token, response.refreshToken, response.user);

      return true;
    } catch (err: any) {
      this.handleError(err);
      return false;
    } finally {
      this.loading = false;
    }
  },

  /**
   * Реєстрація користувача
   */
  async register(data: RegisterData): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const response = await AuthService.register(data);

      this.setAuthData(response.token, response.refreshToken, response.user);

      return true;
    } catch (err: any) {
      this.handleError(err);
      return false;
    } finally {
      this.loading = false;
    }
  },

  /**
   * Вихід користувача
   */
  async logout(): Promise<void> {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  },

  /**
   * Отримання даних користувача
   */
  async fetchUser(): Promise<void> {
    if (!this.token) {
      this.isInitialized = true;
      return;
    }

    try {
      const user = await AuthService.getCurrentUser();
      this.user = user;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      this.clearAuthData();
    } finally {
      this.isInitialized = true;
    }
  },

  /**
   * Ініціалізація стору (викликати при старті додатку)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.fetchUser();
  },

  /**
   * Оновлення токена
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.clearAuthData();
      return false;
    }

    try {
      const response = await AuthService.refreshToken(this.refreshToken);

      this.token = response.token;
      localStorage.setItem(TOKEN_KEY, response.token);

      if (response.refreshToken) {
        this.refreshToken = response.refreshToken;
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }

      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      this.clearAuthData();
      return false;
    }
  },

  /**
   * Оновлення даних користувача
   */
  updateUser(user: Partial<User>): void {
    if (this.user) {
      this.user = { ...this.user, ...user };
    }
  },

  /**
   * Очищення помилки
   */
  clearError(): void {
    this.error = null;
  },

  /**
   * Встановлення помилки
   */
  setError(error: string): void {
    this.error = error;
  },

  /**
   * Збереження даних автентифікації
   */
  setAuthData(token: string, refreshToken: string, user: User): void {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Очищення даних автентифікації
   */
  clearAuthData(): void {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.error = null;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Обробка помилок API
   */
  handleError(err: any): void {
    const apiError = err.response?.data as ApiError;

    if (apiError?.message) {
      this.error = apiError.message;
    } else if (err.message) {
      this.error = err.message;
    } else {
      this.error = 'An unexpected error occurred';
    }
  }
};
