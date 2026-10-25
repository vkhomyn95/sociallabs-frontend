<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbButton, SlbInput } from '@sociallabs/frontend-components'
import { ConnectInput } from '@/stores/credential/types'

const props = defineProps<{
  input: ConnectInput
  message: string
  hint?: string
  /** Why the previous value was rejected (wrong code / password). */
  error?: string
  busy?: boolean
}>()
const emit = defineEmits<{ submit: [input: ConnectInput, value: string] }>()

const value = ref('')

const LABELS: Record<ConnectInput, string> = {
  [ConnectInput.CODE]: 'Confirmation code',
  [ConnectInput.PASSWORD]: 'Two-step verification password',
}

const isPassword = computed(() => props.input === ConnectInput.PASSWORD)

function submit(): void {
  if (value.value.trim()) emit('submit', props.input, value.value.trim())
}
</script>

<template>
  <form class="slb-cred-connect" @submit.prevent="submit">
    <p class="slb-cred-connect__message">{{ message }}</p>
    <SlbInput
      v-model="value"
      class="slb-cred-connect__input"
      :type="isPassword ? 'password' : 'text'"
      :label="LABELS[input]"
      :hint="hint ? `Hint: ${hint}` : undefined"
      :error="value ? undefined : error"
      required
    />
    <SlbButton type="submit" :loading="busy" :disabled="!value.trim()">Continue</SlbButton>
  </form>
</template>
