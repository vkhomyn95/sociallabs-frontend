import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { setAccessToken } from '@/core/services/auth-token'
import { AccountSecurityService, AuthService, createAuthError, parseAuthErrorCode, toAuthError } from './service'
import { AuthErrorCode, AuthStatus } from './types'
import type {
  AuthError,
  AuthFieldErrors,
  AuthResponse,
  AuthUser,
  LoginRequest,
  MfaChallenge,
  MfaMethod,
  MfaStatus,
  OAuthProvider,
  RecoveryCodes,
  RegisterRequest,
  TotpSetup,
} from './types'

const REDIRECT_KEY = 'slb.auth.redirect'
const REFRESH_LOCK = 'slb.auth.refresh'

/** Бекенд закрив challenge (прострочено / вичерпано спроби) — 2FA треба починати з першого кроку. */
const CHALLENGE_RESET_CODES: ReadonlySet<AuthErrorCode> = new Set([
  AuthErrorCode.CHALLENGE_INVALID,
  AuthErrorCode.TOO_MANY_ATTEMPTS,
])

/** Лише внутрішні шляхи — захист від open redirect (`//evil.com`, `https://…`). */
export function safeRedirect(path: unknown, fallback = '/'): string {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : fallback
}

/**
 * Auth store: сесія, кроки входу (пароль / OAuth / 2FA) і налаштування 2FA.
 *
 * Access-токен — лише в пам'яті (auth-token.ts), refresh — HttpOnly cookie на бекенді.
 * Після перезавантаження `initialize()` тихо відновлює сесію через /auth/refresh.
 */
export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const mfaChallenge = ref<(MfaChallenge & { expiresAt: number }) | null>(null)
  const providers = ref<OAuthProvider[]>([])
  const loading = ref(false)
  const pendingProvider = ref<string | null>(null)
  const error = ref<AuthError | null>(null)
  const initialized = ref(false)

  // ─── Getters ───────────────────────────────────────────────────────
  const isAuthenticated = computed<boolean>(() => !!user.value && !!accessToken.value)
  const isMfaPending = computed<boolean>(() => !!mfaChallenge.value)
  const fullName = computed<string>(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
  )
  const initials = computed<string>(() => (fullName.value || user.value?.email || '?').charAt(0).toUpperCase())
  /** Помилки, прив'язані до полів форми. */
  const fieldErrors = computed<AuthFieldErrors>(() => error.value?.fieldErrors ?? {})
  /** Загальна помилка (алерт над формою) — лише коли немає помилок полів. */
  const formError = computed<string | null>(() =>
    error.value && Object.keys(error.value.fieldErrors).length === 0 ? error.value.message : null,
  )

  // ─── Internal ──────────────────────────────────────────────────────
  function applyResponse(response: AuthResponse): AuthStatus {
    if (response.status === AuthStatus.MFA_REQUIRED) {
      mfaChallenge.value = { ...response.mfa, expiresAt: Date.now() + response.mfa.expiresIn * 1000 }
      return response.status
    }
    mfaChallenge.value = null
    user.value = response.user
    accessToken.value = response.accessToken
    setAccessToken(response.accessToken)
    return response.status
  }

  /** Обгортка кроку входу: loading, скидання і мапінг помилок. */
  async function step(action: () => Promise<AuthResponse>): Promise<AuthStatus | null> {
    loading.value = true
    error.value = null
    try {
      return applyResponse(await action())
    } catch (err) {
      error.value = toAuthError(err)
      if (CHALLENGE_RESET_CODES.has(error.value.code)) mfaChallenge.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function clearSession(): void {
    user.value = null
    accessToken.value = null
    mfaChallenge.value = null
    setAccessToken(null)
  }

  /**
   * Один refresh на всі вкладки: cookie спільна, тож друга вкладка вже піде з ротованим токеном.
   * Результат — через змінну, а не через Promise від locks.request: його generic
   * (LockGrantedCallback<T>) з async-колбеком дає T = Promise<…>, і IDE губить тип.
   */
  async function exclusive(fn: () => Promise<boolean>): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.locks) return fn()
    let result = false
    await navigator.locks.request(REFRESH_LOCK, async (): Promise<void> => {
      result = await fn()
    })
    return result
  }

  let refreshInFlight: Promise<boolean> | null = null

  // ─── Session ───────────────────────────────────────────────────────
  /** Новий access-токен за refresh-cookie. Паралельні виклики чекають на один запит. */
  function refresh(): Promise<boolean> {
    refreshInFlight ??= exclusive(async () => {
      try {
        applyResponse(await AuthService.refresh())
        return true
      } catch {
        clearSession()
        return false
      }
    }).finally(() => {
      refreshInFlight = null
    })
    return refreshInFlight
  }

  async function initialize(): Promise<void> {
    if (initialized.value) return
    await refresh()
    initialized.value = true
  }

  async function logout(): Promise<void> {
    try {
      await AuthService.logout()
    } catch {
      // Сесію на клієнті чистимо в будь-якому разі.
    } finally {
      clearSession()
    }
  }

  async function fetchMe(): Promise<void> {
    user.value = await AuthService.me()
  }

  // ─── Sign-in steps ─────────────────────────────────────────────────
  async function fetchProviders(): Promise<void> {
    try {
      providers.value = await AuthService.providers()
    } catch {
      providers.value = []
    }
  }

  function login(request: LoginRequest): Promise<AuthStatus | null> {
    return step(() => AuthService.login(request))
  }

  function register(request: RegisterRequest): Promise<AuthStatus | null> {
    return step(() => AuthService.register(request))
  }

  function verifyMfa(method: MfaMethod, code: string): Promise<AuthStatus | null> {
    const challenge = mfaChallenge.value
    if (!challenge) {
      error.value = createAuthError(AuthErrorCode.CHALLENGE_INVALID)
      return Promise.resolve(null)
    }
    return step(() => AuthService.verifyMfa({ challengeToken: challenge.challengeToken, method, code }))
  }

  function cancelMfa(): void {
    mfaChallenge.value = null
    error.value = null
  }

  /** Повний редірект на провайдера; повернення — через /auth/callback. */
  function startOAuth(providerId: string, redirect?: string): void {
    const provider = providers.value.find((p) => p.id === providerId)
    if (!provider) {
      error.value = createAuthError(AuthErrorCode.OAUTH_FAILED)
      return
    }
    error.value = null
    pendingProvider.value = providerId
    try {
      sessionStorage.setItem(REDIRECT_KEY, safeRedirect(redirect))
    } catch {
      // sessionStorage недоступний (приватний режим) — повернемось на головну.
    }
    window.location.assign(provider.authorizationUrl)
  }

  function completeOAuth(ticket: string): Promise<AuthStatus | null> {
    return step(() => AuthService.exchangeOAuthTicket(ticket))
  }

  /** `code` — сирий ?error= з callback (OAuth-код провайдера або AuthErrorCode бекенду). */
  function failOAuth(code: unknown): void {
    pendingProvider.value = null
    error.value = createAuthError(parseAuthErrorCode(code))
  }

  /** Куди повернутись після OAuth (збережено перед редіректом). */
  function consumeOAuthRedirect(): string {
    try {
      const saved = sessionStorage.getItem(REDIRECT_KEY)
      sessionStorage.removeItem(REDIRECT_KEY)
      return safeRedirect(saved)
    } catch {
      return '/'
    }
  }

  function clearError(): void {
    error.value = null
  }

  // ─── 2FA settings ──────────────────────────────────────────────────
  function mfaStatus(): Promise<MfaStatus> {
    return AccountSecurityService.mfaStatus()
  }

  function beginTotpSetup(): Promise<TotpSetup> {
    return AccountSecurityService.beginTotpSetup()
  }

  async function enableTotp(code: string): Promise<RecoveryCodes> {
    const codes = await AccountSecurityService.enableTotp(code)
    if (user.value) user.value.mfaEnabled = true
    return codes
  }

  async function disableMfa(code: string): Promise<void> {
    await AccountSecurityService.disableMfa(code)
    if (user.value) user.value.mfaEnabled = false
  }

  function regenerateRecoveryCodes(code: string): Promise<RecoveryCodes> {
    return AccountSecurityService.regenerateRecoveryCodes(code)
  }

  async function logoutEverywhere(): Promise<void> {
    await AccountSecurityService.revokeAllSessions()
    clearSession()
  }

  return {
    // state
    user,
    mfaChallenge,
    providers,
    loading,
    pendingProvider,
    error,
    initialized,
    // getters
    isAuthenticated,
    isMfaPending,
    fullName,
    initials,
    fieldErrors,
    formError,
    // session
    initialize,
    refresh,
    logout,
    fetchMe,
    clearSession,
    // sign-in
    fetchProviders,
    login,
    register,
    verifyMfa,
    cancelMfa,
    startOAuth,
    completeOAuth,
    failOAuth,
    consumeOAuthRedirect,
    clearError,
    // 2FA settings
    mfaStatus,
    beginTotpSetup,
    enableTotp,
    disableMfa,
    regenerateRecoveryCodes,
    logoutEverywhere,
  }
})
