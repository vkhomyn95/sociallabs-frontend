import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from './auth-token'

export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1'

const headers = { 'Content-Type': 'application/json' }

/**
 * Запити до /auth/*: лише з ними браузер надсилає й приймає HttpOnly refresh-cookie
 * (withCredentials). Без 401-перехоплювача — інакше невдалий /refresh зациклиться.
 */
export const authHttp: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers,
  timeout: 10000,
  withCredentials: true,
})

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers,
  timeout: 10000,
})

interface SessionHandlers {
  /** Оновлює access-токен; true — можна повторити запит. */
  refresh: () => Promise<boolean>
  /** Сесію не відновити — на сторінку входу. */
  onExpired: () => void
}

// Реєструє main.ts — так api не імпортує store/router і немає циклічних залежностей.
let sessionHandlers: SessionHandlers | null = null

export function registerSessionHandlers(handlers: SessionHandlers): void {
  sessionHandlers = handlers
}

const withBearer = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

api.interceptors.request.use(withBearer)
authHttp.interceptors.request.use(withBearer)

/**
 * 401 означає «access-токен не прийнято», лише якщо це відповідь Spring Security
 * (порожнє тіло) або SESSION_INVALID. 401 з доменним кодом (напр. невірний код 2FA
 * у налаштуваннях) — звичайна помилка запиту, а не протермінована сесія.
 */
function isExpiredAccessToken(error: AxiosError<{ code?: unknown } | undefined>): boolean {
  if (error.response?.status !== 401) return false
  const code = error.response.data?.code
  return code === undefined || code === 'SESSION_INVALID'
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: unknown } | undefined>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!isExpiredAccessToken(error) || !original || original._retry || !sessionHandlers) {
      return Promise.reject(error)
    }
    original._retry = true

    // Паралельні 401 чекають на один refresh (single-flight усередині store).
    if (await sessionHandlers.refresh()) {
      return api(withBearer(original))
    }
    sessionHandlers.onExpired()
    return Promise.reject(error)
  },
)

export default api
