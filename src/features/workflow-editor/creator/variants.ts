import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { CredentialType } from '@/stores/credential/types'

/** Ways to use a messenger, told apart by the credential its nodes need: a personal account or a bot. */
export enum AppVariant {
  ACCOUNT = 'ACCOUNT',
  BOT = 'BOT',
}

export const VARIANT_LABELS: Readonly<Record<AppVariant, string>> = {
  [AppVariant.ACCOUNT]: 'Account',
  [AppVariant.BOT]: 'Bot',
}

/** Shown in this order when an app offers both. */
export const VARIANT_ORDER: readonly AppVariant[] = [AppVariant.ACCOUNT, AppVariant.BOT]

const VARIANT_OF_CREDENTIAL: Readonly<Record<CredentialType, AppVariant | null>> = {
  [CredentialType.TELEGRAM_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.VIBER_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.WHATSAPP_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.INSTAGRAM_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.TIKTOK_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.XCHAT_ACCOUNT]: AppVariant.ACCOUNT,
  [CredentialType.TELEGRAM_BOT]: AppVariant.BOT,
  [CredentialType.VIBER_BOT]: AppVariant.BOT,
  [CredentialType.WHATSAPP_BOT]: AppVariant.BOT,
  [CredentialType.MESSENGER_BOT]: AppVariant.BOT,
  [CredentialType.INSTAGRAM_BOT]: AppVariant.BOT,
  [CredentialType.XCHAT_BOT]: AppVariant.BOT,
  [CredentialType.TIKTOK_BOT]: AppVariant.BOT,
  [CredentialType.OPENAI]: null,
  [CredentialType.ANTHROPIC]: null,
  [CredentialType.GEMINI]: null,
  [CredentialType.API_KEY]: null,
  [CredentialType.BASIC_AUTH]: null,
  [CredentialType.BEARER_TOKEN]: null,
  [CredentialType.REDIS]: null,
}

/** @returns how the node uses its app, null for a node without a messenger credential */
export function variantOf(type: NodeTypeDescriptor): AppVariant | null {
  for (const credential of type.credentials.types) {
    const variant = VARIANT_OF_CREDENTIAL[credential as CredentialType]
    if (variant) return variant
  }
  return null
}
