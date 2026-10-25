import { isAxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import api, { authHttp } from '@/core/services/api'
import { AuthErrorCode, AuthField } from './types'
import type {
  ApiErrorBody,
  ApiErrorDetails,
  AuthError,
  AuthResponse,
  AuthUser,
  LoginRequest,
  MfaStatus,
  MfaVerifyRequest,
  OAuthProvider,
  RecoveryCodes,
  RegisterRequest,
  TotpSetup,
} from './types'

/**
 * Тіло відповіді з явним AxiosResponse<T>: у `get<T, R = AxiosResponse<T>>` WebStorm
 * не підставляє дефолтний R і бачить `.data` як неприв'язаний T.
 */
async function getData<T>(http: AxiosInstance, url: string): Promise<T> {
  const response: AxiosResponse<T> = await http.get<T>(url)
  return response.data
}

async function postData<T>(http: AxiosInstance, url: string, body?: unknown): Promise<T> {
  const response: AxiosResponse<T> = await http.post<T>(url, body)
  return response.data
}

export const AuthService = {
  providers: (): Promise<OAuthProvider[]> => getData(authHttp, '/auth/providers'),

  login: (request: LoginRequest): Promise<AuthResponse> => postData(authHttp, '/auth/login', request),

  register: (request: RegisterRequest): Promise<AuthResponse> => postData(authHttp, '/auth/register', request),

  verifyMfa: (request: MfaVerifyRequest): Promise<AuthResponse> => postData(authHttp, '/auth/mfa/verify', request),

  exchangeOAuthTicket: (ticket: string): Promise<AuthResponse> =>
    postData(authHttp, '/auth/oauth/exchange', { ticket }),

  refresh: (): Promise<AuthResponse> => postData(authHttp, '/auth/refresh'),

  logout: (): Promise<void> => postData(authHttp, '/auth/logout'),

  me: (): Promise<AuthUser> => getData(api, '/auth/me'),
}

/** Керування 2FA поточного користувача (потребує access-токен). */
export const AccountSecurityService = {
  mfaStatus: (): Promise<MfaStatus> => getData(api, '/account/security/mfa'),

  beginTotpSetup: (): Promise<TotpSetup> => postData(api, '/account/security/mfa/totp/setup'),

  enableTotp: (code: string): Promise<RecoveryCodes> => postData(api, '/account/security/mfa/totp/enable', { code }),

  disableMfa: (code: string): Promise<void> => postData(api, '/account/security/mfa/disable', { code }),

  regenerateRecoveryCodes: (code: string): Promise<RecoveryCodes> =>
    postData(api, '/account/security/mfa/recovery-codes', { code }),

  revokeAllSessions: (): Promise<void> => postData(api, '/account/security/sessions/revoke-all'),
}

// Record (не Partial) — новий код у AuthErrorCode без повідомлення не скомпілюється.
const MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Incorrect email or password.',
  [AuthErrorCode.ACCOUNT_DISABLED]: 'This account has been disabled.',
  [AuthErrorCode.TOO_MANY_ATTEMPTS]: 'Too many attempts. Please wait a few minutes and try again.',
  [AuthErrorCode.EMAIL_TAKEN]: 'An account with this email already exists.',
  [AuthErrorCode.MFA_INVALID_CODE]: 'Invalid code.',
  [AuthErrorCode.CHALLENGE_INVALID]: 'Your sign-in attempt expired. Please sign in again.',
  [AuthErrorCode.SESSION_INVALID]: 'Your session has expired. Please sign in again.',
  [AuthErrorCode.MFA_ALREADY_ENABLED]: 'Two-factor authentication is already enabled.',
  [AuthErrorCode.MFA_NOT_ENABLED]: 'Two-factor authentication is not enabled.',
  [AuthErrorCode.MFA_SETUP_REQUIRED]: 'Start the authenticator setup first.',
  [AuthErrorCode.VALIDATION_ERROR]: 'Please check the highlighted fields.',
  [AuthErrorCode.OAUTH_EMAIL_MISSING]: 'The provider did not share your email address.',
  [AuthErrorCode.OAUTH_EMAIL_NOT_VERIFIED]: 'Verify your email address with the provider, then try again.',
  [AuthErrorCode.OAUTH_PROFILE_INVALID]: 'The provider returned an incomplete profile.',
  [AuthErrorCode.OAUTH_FAILED]: 'Sign-in with the provider failed. Please try again.',
  [AuthErrorCode.ACCESS_DENIED]: 'Sign-in was cancelled.',
  [AuthErrorCode.NETWORK_ERROR]: 'Cannot reach the server. Check your connection and try again.',
  [AuthErrorCode.UNKNOWN]: 'Something went wrong. Please try again.',
}

const ERROR_CODES: ReadonlySet<string> = new Set(Object.values(AuthErrorCode))
const FIELDS = Object.values(AuthField)

export function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return typeof value === 'string' && ERROR_CODES.has(value)
}

/** Сирий код (бекенд, ?error= у callback) → AuthErrorCode; невідомий — UNKNOWN. */
export function parseAuthErrorCode(value: unknown): AuthErrorCode {
  return isAuthErrorCode(value) ? value : AuthErrorCode.UNKNOWN
}

export function authErrorMessage(code: AuthErrorCode): string {
  return MESSAGES[code]
}

export function createAuthError(code: AuthErrorCode): AuthError {
  return { code, message: authErrorMessage(code), fieldErrors: {} }
}

/** Будь-яка помилка axios → типізований AuthError з повідомленнями для полів. */
export function toAuthError(error: unknown): AuthError {
  if (!isAxiosError<ApiErrorBody>(error)) return createAuthError(AuthErrorCode.UNKNOWN)
  if (!error.response) return createAuthError(AuthErrorCode.NETWORK_ERROR)

  const body = error.response.data
  const result = createAuthError(parseAuthErrorCode(body?.code))
  const details: ApiErrorDetails = body?.details ?? {}

  for (const field of FIELDS) {
    const message = details[field]
    if (typeof message === 'string') result.fieldErrors[field] = message
  }

  if (result.code === AuthErrorCode.MFA_INVALID_CODE) {
    const left = details.attemptsRemaining
    result.fieldErrors[AuthField.CODE] = typeof left === 'number'
      ? `Invalid code. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`
      : 'Invalid code.'
  }
  return result
}
