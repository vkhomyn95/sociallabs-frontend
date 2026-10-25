import { computed, inject, provide, ref, shallowRef } from 'vue'
import type { InjectionKey } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toAuthError } from '@/stores/auth/service'
import type { MfaStatus } from '@/stores/auth/types'
import { MfaSensitiveAction, MfaState } from './mfa.types'
import type { MfaFlowState, MfaSettings } from './mfa.types'

const MFA_SETTINGS: InjectionKey<MfaSettings> = Symbol('MfaSettings')

const QR_OPTIONS = { margin: 1, width: 176 } as const

/**
 * Стан і дії картки 2FA:
 *   overview → setup (QR + перший код) → recovery-codes (показуються один раз) → overview;
 *   overview → confirm(disable | regenerate-codes) → overview / recovery-codes.
 *
 * Викликається один раз у ProfileSecurity і надається крокам через provide.
 */
export function provideMfaSettings(): MfaSettings {
  const auth = useAuthStore()

  const status = ref<MfaStatus | null>(null)
  const state = shallowRef<MfaFlowState>(MfaState.overview())
  const busy = ref(false)
  const error = ref<string | null>(null)

  /** Спільна обгортка дій: busy, скидання і мапінг помилки. */
  async function run(action: () => Promise<void>): Promise<boolean> {
    busy.value = true
    error.value = null
    try {
      await action()
      return true
    } catch (err) {
      error.value = toAuthError(err).message
      return false
    } finally {
      busy.value = false
    }
  }

  function navigate(next: MfaFlowState): void {
    error.value = null
    state.value = next
  }

  async function refreshStatus(): Promise<void> {
    status.value = await auth.mfaStatus()
  }

  async function disable(code: string): Promise<MfaFlowState> {
    await auth.disableMfa(code)
    return MfaState.overview()
  }

  async function regenerateCodes(code: string): Promise<MfaFlowState> {
    const { codes } = await auth.regenerateRecoveryCodes(code)
    return MfaState.recoveryCodes(codes)
  }

  /** Що робить кожна чутлива дія і куди веде після неї. */
  const SENSITIVE_ACTIONS: Record<MfaSensitiveAction, (code: string) => Promise<MfaFlowState>> = {
    [MfaSensitiveAction.DISABLE]: disable,
    [MfaSensitiveAction.REGENERATE_CODES]: regenerateCodes,
  }

  const settings: MfaSettings = {
    status: computed(() => status.value),
    state: computed(() => state.value),
    busy: computed(() => busy.value),
    error: computed(() => error.value),

    load: () => run(refreshStatus),

    startSetup: () => run(async () => {
      const setup = await auth.beginTotpSetup()
      // qrcode потрібен лише тут — окремий chunk замість основного бандла.
      const { toDataURL } = await import('qrcode')
      const qrDataUrl = await toDataURL(setup.otpauthUri, QR_OPTIONS)
      navigate(MfaState.setup({ setup, qrDataUrl }))
    }),

    enable: (code: string) => run(async () => {
      const { codes } = await auth.enableTotp(code)
      navigate(MfaState.recoveryCodes(codes))
      await refreshStatus()
    }),

    confirm: (action: MfaSensitiveAction, code: string) => run(async () => {
      navigate(await SENSITIVE_ACTIONS[action](code.trim()))
      await refreshStatus()
    }),

    requestConfirmation: (action: MfaSensitiveAction) => navigate(MfaState.confirm(action)),
    backToOverview: () => navigate(MfaState.overview()),
  }

  provide(MFA_SETTINGS, settings)
  return settings
}

/** Контекст картки 2FA всередині кроків. */
export function useMfaSettings(): MfaSettings {
  const settings = inject(MFA_SETTINGS)
  if (!settings) throw new Error('useMfaSettings() must be used inside ProfileSecurity')
  return settings
}
