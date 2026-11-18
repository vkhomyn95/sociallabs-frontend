import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'
import { CredentialKind, CredentialPlatform, CredentialStatus } from '@/stores/credential/types'
import type { Credential } from '@/stores/credential/types'

// Presentation of credential enums. Records make a missing entry a compile error.

export interface PlatformUi {
  label: string
  icon: SlbIconName
  /** Library palette token name used for the icon tile. */
  tone: string
}

export const PLATFORM_UI: Record<CredentialPlatform, PlatformUi> = {
  [CredentialPlatform.TELEGRAM]: { label: 'Telegram', icon: 'brand_telegram', tone: 'sky' },
  [CredentialPlatform.VIBER]: { label: 'Viber', icon: 'brand_viber', tone: 'violet' },
  [CredentialPlatform.WHATSAPP]: { label: 'WhatsApp', icon: 'brand_whatsapp', tone: 'success' },
  [CredentialPlatform.MESSENGER]: { label: 'Messenger', icon: 'brand_messenger', tone: 'blue' },
  [CredentialPlatform.INSTAGRAM]: { label: 'Instagram', icon: 'brand_instagram', tone: 'pink' },
  [CredentialPlatform.X]: { label: 'X', icon: 'brand_x', tone: 'gray-900' },
  [CredentialPlatform.TIKTOK]: { label: 'TikTok', icon: 'brand_tiktok', tone: 'gray-900' },
  [CredentialPlatform.OPENAI]: { label: 'OpenAI', icon: 'ai_sparkles', tone: 'gray-900' },
  [CredentialPlatform.ANTHROPIC]: { label: 'Anthropic', icon: 'ai_sparkle', tone: 'orange' },
  [CredentialPlatform.GEMINI]: { label: 'Google Gemini', icon: 'brand_google', tone: 'blue' },
  [CredentialPlatform.HTTP]: { label: 'HTTP', icon: 'action_key', tone: 'gray-600' },
  [CredentialPlatform.REDIS]: { label: 'Redis', icon: 'dev_database', tone: 'rose' },
}

export interface StatusUi {
  label: string
  color: BadgeColor
}

export const STATUS_UI: Record<CredentialStatus, StatusUi> = {
  [CredentialStatus.ACTIVE]: { label: 'Active', color: 'success' },
  [CredentialStatus.ERROR]: { label: 'Error', color: 'error' },
  [CredentialStatus.DISCONNECTED]: { label: 'Disconnected', color: 'warning' },
}

export interface KindUi {
  icon: SlbIconName
  addLabel: string
  emptyTitle: string
  emptyText: string
}

export const KIND_UI: Record<CredentialKind, KindUi> = {
  [CredentialKind.ACCOUNT]: {
    icon: 'object_user',
    addLabel: 'Connect account',
    emptyTitle: 'No accounts connected',
    emptyText: 'Connect your Telegram or Viber account to send and receive messages from workflows.',
  },
  [CredentialKind.BOT]: {
    icon: 'object_robot',
    addLabel: 'Add bot',
    emptyTitle: 'No bots yet',
    emptyText: 'Add a bot token from Telegram, Viber, WhatsApp Business or a Meta page.',
  },
  [CredentialKind.AI_PROVIDER]: {
    icon: 'ai_sparkles',
    addLabel: 'Add provider',
    emptyTitle: 'No AI providers',
    emptyText: 'Add an OpenAI or Anthropic API key to power your AI agents.',
  },
  [CredentialKind.GENERIC]: {
    icon: 'action_key',
    addLabel: 'Add credential',
    emptyTitle: 'No credentials yet',
    emptyText: 'Store API keys, bearer tokens or basic auth to use them in HTTP request nodes.',
  },
}

/** Metadata key of the account phone number, filled by the backend from the authorized profile. */
export const PHONE_METADATA_KEY = 'phoneNumber'

/**
 * @param value phone number with or without the leading plus (TDLib omits it)
 * @returns international form, e.g. "+380981234567"
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? `+${digits}` : value
}

/**
 * @param credential account credential
 * @returns formatted phone number of the signed-in account, or null when the platform does not report it
 */
export function accountPhone(credential: Credential): string | null {
  const value = credential.metadata[PHONE_METADATA_KEY]
  return value ? formatPhone(value) : null
}

/** Metadata keys shown as identity hints, in priority order, with optional formatting. */
const METADATA_HINTS: { key: string; format?: (value: string) => string }[] = [
  { key: 'username', format: (v) => `@${v}` },
  { key: PHONE_METADATA_KEY, format: formatPhone },
  { key: 'accountName' },
  { key: 'pageName' },
  { key: 'verifiedName' },
  { key: 'name' },
  { key: 'apiKey' },
  { key: 'token' },
  { key: 'value' },
]

/**
 * Short, non-secret hints that identify a credential (username, phone, masked key).
 *
 * @param credential credential to describe
 * @param limit max number of hints
 * @param exclude metadata keys already shown elsewhere (e.g. in their own column)
 * @returns formatted hints
 */
export function credentialHints(credential: Credential, limit = 2, exclude: readonly string[] = []): string[] {
  const hints: string[] = []
  for (const { key, format } of METADATA_HINTS) {
    if (exclude.includes(key)) continue
    const value = credential.metadata[key]
    if (!value) continue
    const text = format ? format(value) : value
    if (text !== credential.name && !hints.includes(text)) hints.push(text)
    if (hints.length >= limit) break
  }
  return hints
}

/**
 * Human-friendly relative date for list cells.
 *
 * @param iso ISO date string
 * @returns relative or absolute date
 */
export function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

/**
 * Extract a readable message from an API error (backend ErrorResponse) or fall back.
 *
 * @param error thrown value
 * @param fallback message used when nothing better is available
 * @returns message and optional field errors
 */
export function toApiError(error: unknown, fallback = 'Something went wrong'): { message: string; fields: Record<string, string> } {
  const data = (error as { response?: { data?: { message?: string; details?: Record<string, string> } } })?.response?.data
  return {
    message: data?.message ?? (error instanceof Error ? error.message : fallback),
    fields: data?.details ?? {},
  }
}
