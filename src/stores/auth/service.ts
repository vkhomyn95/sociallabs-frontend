import api from '@/core/services/api.ts'
import type { LoginCredentials, RegisterData, AuthResponse, User } from './types';

class AuthServiceClass {
  /**
   * Вхід користувача
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Реєстрація користувача
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Отримання поточного користувача
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Оновлення токена
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    });
    return response.data;
  }

  /**
   * Вихід користувача
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ігноруємо помилки при logout
      console.error('Logout error:', error);
    }
  }

  /**
   * Верифікація email
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  /**
   * Відправка листа для відновлення пароля
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  /**
   * Скидання пароля
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  /**
   * Зміна пароля
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
  }
}

export const AuthService = new AuthServiceClass();
