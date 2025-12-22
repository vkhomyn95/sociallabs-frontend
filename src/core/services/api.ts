import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Створюємо окремий інстанс для refresh token запитів
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Флаг для запобігання множинним спробам оновлення токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor з підтримкою refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Якщо помилка 401 і це не повторний запит
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Якщо вже відбувається оновлення токена, додаємо запит в чергу
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // Немає refresh token - виходимо
        isRefreshing = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Використовуємо окремий інстанс для refresh запиту
        const response = await refreshApi.post('/auth/refresh', {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('auth_token', token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Оновлюємо токен в оригінальному запиті
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        processQueue(null);
        isRefreshing = false;

        // Повторюємо оригінальний запит
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        isRefreshing = false;

        // Refresh не вдався - виходимо
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Інші помилки
    return Promise.reject(error);
  }
);

export default api;
