import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { MfaView } from './mfa.types'
import MfaOverviewStep from './steps/MfaOverviewStep.vue'

// Registry of 2FA card steps
// Add new steps here only — Record makes a missing view a compile error

export const MFA_STEP_REGISTRY: Record<MfaView, Component> = {
  // Перший екран — без async, щоб картка не блимала при завантаженні.
  [MfaView.OVERVIEW]: MfaOverviewStep,

  [MfaView.SETUP]:
    defineAsyncComponent(() =>
      import('./steps/MfaSetupStep.vue')
    ),

  [MfaView.RECOVERY_CODES]:
    defineAsyncComponent(() =>
      import('./steps/MfaRecoveryCodesStep.vue')
    ),

  [MfaView.CONFIRM]:
    defineAsyncComponent(() =>
      import('./steps/MfaConfirmStep.vue')
    ),
}
