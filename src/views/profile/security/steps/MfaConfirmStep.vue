<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbOtpInput } from '@sociallabs/frontend-components'
import { SlbButton } from '@sociallabs/frontend-components'
import { SlbInput } from '@sociallabs/frontend-components'
import { useMfaSettings } from '../useMfaSettings'
import { MFA_CONFIRM_CONFIG } from '../mfa-confirm-config'
import { MfaCodeInput } from '../mfa.types'
import type { MfaConfirmConfig, MfaConfirmStepProps } from '../mfa.types'

/** Підтвердження чутливої дії актуальним кодом; тексти і тип поля — з MFA_CONFIRM_CONFIG. */
const props = defineProps<MfaConfirmStepProps>()

const { busy, confirm, backToOverview } = useMfaSettings()

const config = computed<MfaConfirmConfig>(() => MFA_CONFIRM_CONFIG[props.action])
const code = ref<string>('')

async function submit(): Promise<void> {
  if (!(await confirm(props.action, code.value))) code.value = ''
}
</script>

<template>
  <form class="slb-security__step" @submit.prevent="submit">
    <p class="slb-security__text">{{ config.description }}</p>

    <SlbOtpInput
      v-if="config.input === MfaCodeInput.TOTP"
      v-model="code"
      :disabled="busy"
      autofocus
      @complete="submit"
    />
    <SlbInput
      v-else
      v-model="code"
      label="Code"
      placeholder="123456 or xxxxx-xxxxx"
      autocomplete="one-time-code"
      :disabled="busy"
    />

    <div class="slb-profile__form-actions">
      <SlbButton variant="ghost" size="sm" :disabled="busy" @click="backToOverview">Cancel</SlbButton>
      <SlbButton type="submit" :variant="config.variant" size="sm" :loading="busy" :disabled="busy || !code.trim()">
        {{ config.submitLabel }}
      </SlbButton>
    </div>
  </form>
</template>
