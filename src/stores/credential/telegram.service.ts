import api from '@/core/services/api.ts'
import { EventSourcePolyfill } from 'event-source-polyfill';

export const TelegramCredentialService = {

  async startAuth(data: {
    apiId: string;
    apiHash: string;
    phoneNumber?: string;
    authMethod: 'qrcode' | 'phone';
  }): Promise<{ sessionId: string }> {
    try {
      const response = await api.post('/telegram-client-credentials/start', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to start Telegram auth:', error);
      throw error;
    }
  },

  async submitCode(sessionId: string, code: string): Promise<void> {
    try {
      await api.post('/telegram-client-credentials/submit-code', { sessionId, code });
    } catch (error: any) {
      console.error('Failed to submit code:', error);
      throw error;
    }
  },

  async submitPassword(sessionId: string, password: string): Promise<void> {
    try {
      await api.post('/telegram-client-credentials/submit-password', { sessionId, password });
    } catch (error: any) {
      console.error('Failed to submit password:', error);
      throw error;
    }
  },

  async cancelAuth(sessionId: string): Promise<void> {
    try {
      await api.delete(`/telegram-client-credentials/cancel/${sessionId}`);
    } catch (error: any) {
      console.error('Failed to cancel auth:', error);
      throw error;
    }
  },

  async getStatus(sessionId: string): Promise<any> {
    try {
      const response = await api.get(`/telegram-client-credentials/status/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get auth status:', error);
      throw error;
    }
  },

  createEventSource(sessionId: string): EventSource {
    // EventSource не підтримує custom headers (tokens), тому використовуємо прямий URL
    // Якщо потрібна авторизація для SSE, треба передавати token в query params
    const baseUrl = import.meta.env.VITE_API_URL;

    // Отримуємо token якщо є
    const token = localStorage.getItem('auth_token');

    // Будуємо URL з токеном в query params (якщо SSE endpoint це підтримує)
    let url = `${baseUrl}/telegram-client-credentials/updates/${sessionId}`;

    return new EventSourcePolyfill(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
  }
};
