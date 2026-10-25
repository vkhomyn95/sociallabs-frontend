import { MfaCodeInput, MfaSensitiveAction } from './mfa.types'
import type { MfaConfirmConfig } from './mfa.types'

/** Тексти й поле вводу для кожної чутливої дії — новий action без конфігу не скомпілюється. */
export const MFA_CONFIRM_CONFIG: Record<MfaSensitiveAction, MfaConfirmConfig> = {
  [MfaSensitiveAction.DISABLE]: {
    description: 'Enter a code from your authenticator app or a recovery code to turn off 2FA.',
    submitLabel: 'Disable 2FA',
    variant: 'danger',
    input: MfaCodeInput.TOTP_OR_RECOVERY,
  },
  [MfaSensitiveAction.REGENERATE_CODES]: {
    description: 'Enter a code from your authenticator app. Your old recovery codes will stop working.',
    submitLabel: 'Generate codes',
    variant: 'primary',
    input: MfaCodeInput.TOTP,
  },
}
