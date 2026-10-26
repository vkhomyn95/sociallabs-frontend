<script setup lang="ts">
import { ref } from 'vue'
import { SlbOtpInput } from '@sociallabs/frontend-components'
import { SlbButton } from '@sociallabs/frontend-components'
import { useMfaSettings } from '../useMfaSettings'
import type { MfaSetupStepProps } from '../mfa.types'

/** Крок 1 увімкнення: скан QR (або ключ вручну) + перший код, що підтверджує налаштування. */
const props = defineProps<MfaSetupStepProps>()

const { busy, enable, backToOverview } = useMfaSettings()

const code = ref<string>('')

async function submit(): Promise<void> {
  if (!(await enable(code.value))) code.value = ''
}
</script>

<template>
  <form class="slb-security__step" @submit.prevent="submit">
    <ol class="slb-security__steps">
      <li>Scan the QR code with your authenticator app.</li>
      <li>Enter the 6-digit code it shows.</li>
    </ol>

    <img :src="props.qrDataUrl" alt="Authenticator QR code" class="slb-security__qr" width="176" height="176" />

    <details class="slb-security__manual">
      <summary>Can't scan? Enter the key manually</summary>
      <code>{{ props.setup.secret }}</code>
    </details>

    <SlbOtpInput v-model="code" :disabled="busy" autofocus @complete="submit" />

    <div class="slb-profile__form-actions">
      <SlbButton variant="ghost" size="sm" :disabled="busy" @click="backToOverview">Cancel</SlbButton>
      <SlbButton type="submit" variant="primary" size="sm" :loading="busy" :disabled="busy || code.length < 6">
        Verify and enable
      </SlbButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.slb-security {
  &__steps {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--gray-600);
  }

  &__qr {
    align-self: center;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
  }

  &__manual {
    font-size: 12px;
    color: var(--gray-500);

    summary { cursor: pointer; }

    code {
      display: block;
      margin-top: 6px;
      padding: 8px;
      border-radius: 6px;
      background: var(--gray-50);
      font-family: ui-monospace, Menlo, monospace;
      letter-spacing: 0.08em;
      word-break: break-all;
      color: var(--gray-800);
    }
  }
}
</style>
