<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { SlbInput } from '@sociallabs/frontend-components'
import type { Credential, CredentialTypeDescriptor } from '@/stores/credential/types'
import CredentialPlatformIcon from '../CredentialPlatformIcon.vue'
import CredentialFields from '../CredentialFields.vue'
import { useCredentialForm } from '../useCredentialForm'
import { useAccountConnect } from './useAccountConnect'
import { CONNECT_STEP_REGISTRY } from './connect-step-registry'
import { ConnectView } from './connect.types'

/**
 * Interactive account connection: start parameters form, then backend-driven screens
 * (QR code, confirmation code, 2FA password). The surrounding modal owns the buttons.
 */
const props = defineProps<{ descriptor: CredentialTypeDescriptor }>()
const emit = defineEmits<{ connected: [credential: Credential] }>()

const name = ref('')
const form = useCredentialForm(computed(() => props.descriptor.fields))
const { state, busy, finished, start, submit, retry } = useAccountConnect(props.descriptor, (c) => emit('connected', c))

const isParams = computed(() => state.value.view === ConnectView.PARAMS)
const canStart = computed(() => isParams.value && form.isComplete.value && !busy.value)

interface ActiveStep {
  key: string
  component: Component
  props: Record<string, unknown>
}

// Step data (everything except `view`) goes to the step as props.
const activeStep = computed<ActiveStep | null>(() => {
  const { view, ...stepProps } = state.value
  if (view === ConnectView.PARAMS) return null
  return { key: view, component: CONNECT_STEP_REGISTRY[view], props: { ...stepProps, busy: busy.value } }
})

/** Start the connection with the entered parameters. */
async function connect(): Promise<void> {
  if (canStart.value) await start(name.value.trim(), form.payload())
}

defineExpose({ connect, retry, canStart, busy, finished, view: computed(() => state.value.view) })
</script>

<template>
  <form v-if="isParams" class="slb-cred-form" @submit.prevent="connect">
    <div class="slb-cred-form__type">
      <CredentialPlatformIcon :platform="descriptor.platform" />
      <div>
        <div class="slb-cred-form__type-name">{{ descriptor.displayName }}</div>
        <div class="slb-cred-form__type-desc">{{ descriptor.description }}</div>
      </div>
    </div>

    <SlbInput v-model="name" label="Name" placeholder="Generated from the account if empty" />
    <CredentialFields :form="form" />

    <button type="submit" hidden />
  </form>

  <component
    :is="activeStep.component"
    v-else-if="activeStep"
    :key="activeStep.key"
    v-bind="activeStep.props"
    @submit="submit"
  />
</template>

<style lang="scss">
.slb-cred-connect {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--slb-space-lg);
  padding: var(--slb-space-lg) 0;
  text-align: center;

  &__qr {
    width: 208px;
    height: 208px;
    padding: var(--slb-space-sm);
    border: 1px solid var(--slb-color-border);
    border-radius: var(--slb-radius-lg);
    background: var(--slb-color-white);
  }
  &__message { margin: 0; max-width: 40ch; font-size: var(--slb-font-base); color: var(--slb-color-gray-700); }
  &__steps {
    margin: 0;
    padding-left: 18px;
    text-align: left;
    font-size: var(--slb-font-md);
    color: var(--slb-color-text-muted);
  }
  &__input { width: 100%; max-width: 280px; }
  &__result-icon--success { color: var(--slb-color-success); }
  &__result-icon--error { color: var(--slb-color-error); }
}
.slb-cred-connect__spinner {
  color: var(--slb-color-primary);
  animation: slb-cred-spin 0.9s linear infinite;
}

@keyframes slb-cred-spin {
  to { transform: rotate(360deg); }
}
</style>
