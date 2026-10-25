<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useMfaSettings } from '../useMfaSettings'
import { copyRecoveryCodes, downloadRecoveryCodes } from '../recovery-codes'
import type { MfaRecoveryCodesStepProps } from '../mfa.types'

/** Резервні коди — бекенд віддає їх лише один раз, тож тут їх треба зберегти. */
const props = defineProps<MfaRecoveryCodesStepProps>()

const { backToOverview } = useMfaSettings()

const COPIED_FEEDBACK_MS = 2000
const copied = ref<boolean>(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function copy(): Promise<void> {
  await copyRecoveryCodes(props.codes)
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), COPIED_FEEDBACK_MS)
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <div class="slb-security__step">
    <p class="slb-security__text">
      Save these recovery codes somewhere safe. Each one signs you in once if you lose your phone.
      <strong>They won't be shown again.</strong>
    </p>

    <ul class="slb-security__codes">
      <li v-for="item in props.codes" :key="item"><code>{{ item }}</code></li>
    </ul>

    <div class="slb-profile__form-actions">
      <SlbButton variant="secondary" size="sm" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</SlbButton>
      <SlbButton variant="secondary" size="sm" @click="downloadRecoveryCodes(props.codes)">Download</SlbButton>
      <SlbButton variant="primary" size="sm" @click="backToOverview">I saved them</SlbButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.slb-security__codes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin: 0;
  padding: 12px;
  list-style: none;
  border-radius: 8px;
  background: var(--gray-50);

  code {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 13px;
    color: var(--gray-800);
  }
}
</style>
