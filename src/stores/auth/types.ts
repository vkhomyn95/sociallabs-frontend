// Типи відповідають DTO бекенду (/api/v1/auth, /api/v1/account/security).

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string | null
  role: UserRole
  emailVerified: boolean
  mfaEnabled: boolean
  /** false — акаунт створено через OAuth, пароля немає. */
  hasPassword: boolean
}

export enum MfaMethod {
  TOTP = 'TOTP',
  RECOVERY_CODE = 'RECOVERY_CODE',
}

/** Результат кроку входу (`status` у відповіді бекенду) — визначає наступний крок. */
export enum AuthStatus {
  AUTHENTICATED = 'AUTHENTICATED',
  MFA_REQUIRED = 'MFA_REQUIRED',
}

/**
 * Кроки екрана входу. Значення збігаються з `SlbAuthStep` бібліотеки —
 * відповідність перевіряється мапою в views/auth/auth-flow.ts.
 */
export enum AuthStep {
  /** Email + OAuth-провайдери. */
  START = 'start',
  PASSWORD = 'password',
  REGISTER = 'register',
  MFA = 'mfa',
}

export interface MfaChallenge {
  challengeToken: string
  methods: MfaMethod[]
  /** Секунди життя challenge. */
  expiresIn: number
}

export interface AuthenticatedResponse {
  status: AuthStatus.AUTHENTICATED
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

export interface MfaRequiredResponse {
  status: AuthStatus.MFA_REQUIRED
  mfa: MfaChallenge
}

/** Відповідь кожного кроку входу — discriminated union за `status`. */
export type AuthResponse = AuthenticatedResponse | MfaRequiredResponse

export interface OAuthProvider {
  id: string
  name: string
  authorizationUrl: string
}

export interface LoginRequest {
  email: string
  password: string
  remember: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  remember: boolean
}

export interface MfaVerifyRequest {
  challengeToken: string
  method: MfaMethod
  code: string
}

export interface MfaStatus {
  totpEnabled: boolean
  recoveryCodesRemaining: number
}

export interface TotpSetup {
  secret: string
  otpauthUri: string
}

export interface RecoveryCodes {
  codes: string[]
}

/** Коди AuthErrorCode бекенду + OAuth-коди з /auth/callback?error= + клієнтські. */
export enum AuthErrorCode {
  // Бекенд
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  MFA_INVALID_CODE = 'MFA_INVALID_CODE',
  CHALLENGE_INVALID = 'CHALLENGE_INVALID',
  SESSION_INVALID = 'SESSION_INVALID',
  MFA_ALREADY_ENABLED = 'MFA_ALREADY_ENABLED',
  MFA_NOT_ENABLED = 'MFA_NOT_ENABLED',
  MFA_SETUP_REQUIRED = 'MFA_SETUP_REQUIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // OAuth
  OAUTH_EMAIL_MISSING = 'OAUTH_EMAIL_MISSING',
  OAUTH_EMAIL_NOT_VERIFIED = 'OAUTH_EMAIL_NOT_VERIFIED',
  OAUTH_PROFILE_INVALID = 'OAUTH_PROFILE_INVALID',
  OAUTH_FAILED = 'OAUTH_FAILED',
  /** Стандартний OAuth 2.0 код — користувач скасував вхід у провайдера. */
  ACCESS_DENIED = 'access_denied',
  // Клієнтські
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * `details` помилки: повідомлення для полів форми + службові значення.
 * Значення приходять з мережі — перед використанням перевіряються через typeof.
 */
export interface ApiErrorDetails extends Partial<Record<AuthField, unknown>> {
  /** MFA_INVALID_CODE при вході — скільки спроб лишилось у challenge. */
  attemptsRemaining?: unknown
}

/** Тіло помилки GlobalExceptionHandler. */
export interface ApiErrorBody {
  /** Сирий код з бекенду — до AuthErrorCode приводиться через parseAuthErrorCode. */
  code: string
  message: string
  details?: ApiErrorDetails
  timestamp?: string
}

/** Поля форм входу, до яких бекенд прив'язує помилки (`details.<field>`). */
export enum AuthField {
  EMAIL = 'email',
  PASSWORD = 'password',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  CODE = 'code',
}

/** Повідомлення біля полів форми. */
export type AuthFieldErrors = Partial<Record<AuthField, string>>

export interface AuthError {
  code: AuthErrorCode
  /** Повідомлення для користувача (форма). */
  message: string
  fieldErrors: AuthFieldErrors
}
