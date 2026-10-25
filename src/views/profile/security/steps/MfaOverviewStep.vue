<script setup lang="ts">
import { computed } from 'vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useMfaSettings } from '../useMfaSettings'
import { MfaSensitiveAction } from '../mfa.types'

/** Поточний стан 2FA і вхідні точки: увімкнути / нові коди / вимкнути. */
const { status, busy, startSetup, requestConfirmation } = useMfaSettings()

const codesLeft = computed<string>(() => {
  const left = status.value?.recoveryCodesRemaining ?? 0
  return `${left} recovery ${left === 1 ? 'code' : 'codes'} left.`
})
</script>

<template>
  <div v-if="status" class="slb-security__step">
    <p v-if="status.totpEnabled" class="slb-security__text">
      Sign-ins require a code from your authenticator app. {{ codesLeft }}
    </p>
    <p v-else class="slb-security__text">
      Protect your account with a one-time code from an authenticator app
      (Google Authenticator, 1Password, Authy) in addition to your password or social login.
    </p>

    <div class="slb-profile__form-actions">
      <template v-if="status.totpEnabled">
        <SlbButton variant="secondary" size="sm" @click="requestConfirmation(MfaSensitiveAction.REGENERATE_CODES)">
          New recovery codes
        </SlbButton>
        <SlbButton variant="danger" size="sm" @click="requestConfirmation(MfaSensitiveAction.DISABLE)">
          Disable
        </SlbButton>
      </template>
      <SlbButton v-else variant="primary" size="sm" :loading="busy" :disabled="busy" @click="startSetup">
        Enable 2FA
      </SlbButton>
    </div>
  </div>

  <div v-else class="slb-security__skeleton" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.slb-security__skeleton {
  height: 64px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--gray-50), var(--gray-100), var(--gray-50));
  background-size: 200% 100%;
  animation: slb-security-shimmer 1.2s ease-in-out infinite;
}

@keyframes slb-security-shimmer {
  to { background-position: -200% 0; }
}
</style>
