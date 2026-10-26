import type { ComputedRef } from 'vue'
import type { ButtonVariant } from '@sociallabs/frontend-components'
import type { MfaStatus, TotpSetup } from '@/stores/auth/types'

/**
 * Екрани картки 2FA. Кожному відповідає компонент у mfa-step-registry.ts.
 *
 * `as const`-об'єкт, а не enum: це дискримінант union-а MfaFlowState, і рядкові
 * літерали звужуються однаково і в tsc, і в аналізаторі IDE (член enum в об'єктному
 * літералі WebStorm розширює до всього enum-а і губить варіант union-а).
 */
export const MfaView = {
  OVERVIEW: 'overview',
  SETUP: 'setup',
  RECOVERY_CODES: 'recovery-codes',
  CONFIRM: 'confirm',
} as const

export type MfaView = (typeof MfaView)[keyof typeof MfaView]

/** Дії, що вимагають актуальний код 2FA. */
export enum MfaSensitiveAction {
  DISABLE = 'disable',
  REGENERATE_CODES = 'regenerate-codes',
}

/** Яке поле показати для підтвердження. */
export enum MfaCodeInput {
  /** 6 цифр з автентифікатора. */
  TOTP = 'totp',
  /** Код з автентифікатора або резервний код. */
  TOTP_OR_RECOVERY = 'totp-or-recovery',
}

// ─── Props кроків ───────────────────────────────────────────────────
// Окремі інтерфейси (а не Extract<…>) — їх напряму читає defineProps.

export interface MfaSetupStepProps {
  setup: TotpSetup
  qrDataUrl: string
}

export interface MfaRecoveryCodesStepProps {
  codes: string[]
}

export interface MfaConfirmStepProps {
  action: MfaSensitiveAction
}

// ─── Стан ───────────────────────────────────────────────────────────

export interface MfaOverviewState {
  view: typeof MfaView.OVERVIEW
}

export interface MfaSetupState extends MfaSetupStepProps {
  view: typeof MfaView.SETUP
}

export interface MfaRecoveryCodesState extends MfaRecoveryCodesStepProps {
  view: typeof MfaView.RECOVERY_CODES
}

export interface MfaConfirmState extends MfaConfirmStepProps {
  view: typeof MfaView.CONFIRM
}

/**
 * Стан картки — discriminated union за `view`: дані кроку існують лише
 * разом із самим кроком (немає `setup: null` поруч із `view: 'codes'`).
 */
export type MfaFlowState = MfaOverviewState | MfaSetupState | MfaRecoveryCodesState | MfaConfirmState

/** Єдине місце, де збираються об'єкти стану, — решта коду працює з готовими типами. */
export const MfaState = {
  overview: (): MfaOverviewState => ({ view: MfaView.OVERVIEW }),
  setup: (props: MfaSetupStepProps): MfaSetupState => ({ view: MfaView.SETUP, ...props }),
  recoveryCodes: (codes: string[]): MfaRecoveryCodesState => ({ view: MfaView.RECOVERY_CODES, codes }),
  confirm: (action: MfaSensitiveAction): MfaConfirmState => ({ view: MfaView.CONFIRM, action }),
}

export interface MfaConfirmConfig {
  description: string
  submitLabel: string
  variant: ButtonVariant
  input: MfaCodeInput
}

/**
 * Контекст, який ProfileSecurity надає крокам (provide/inject).
 * Дії повертають `true` при успіху — крок сам вирішує, що робити з локальним вводом.
 */
export interface MfaSettings {
  status: ComputedRef<MfaStatus | null>
  state: ComputedRef<MfaFlowState>
  busy: ComputedRef<boolean>
  error: ComputedRef<string | null>
  load(): Promise<boolean>
  startSetup(): Promise<boolean>
  enable(code: string): Promise<boolean>
  confirm(action: MfaSensitiveAction, code: string): Promise<boolean>
  requestConfirmation(action: MfaSensitiveAction): void
  backToOverview(): void
}
