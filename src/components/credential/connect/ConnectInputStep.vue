<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbButton, SlbInput } from '@sociallabs/frontend-components'
import { ConnectInput, ConnectPin } from '@/stores/credential/types'

const props = defineProps<{
  input: ConnectInput
  message: string
  hint?: string
  /** Why the previous value was rejected (wrong code / password). */
  error?: string
  /** Set when the password is an XChat PIN: which one. */
  pin?: ConnectPin
  busy?: boolean
}>()
const emit = defineEmits<{ submit: [input: ConnectInput, value: string] }>()

const value = ref('')

const LABELS: Record<ConnectInput, string> = {
  [ConnectInput.CODE]: 'Confirmation code',
  [ConnectInput.PASSWORD]: 'Two-step verification password',
}

const PIN_LABELS: Record<ConnectPin, string> = {
  [ConnectPin.UNLOCK]: 'XChat PIN',
  [ConnectPin.SET_UP]: 'New XChat PIN',
}

/** What the field takes; an XChat PIN goes by its own name. */
const label = computed(() => (props.pin ? PIN_LABELS[props.pin] : LABELS[props.input]))

const isPassword = computed(() => props.input === ConnectInput.PASSWORD)

/** The backend's hint, or for a new PIN the reminder that the X app asks for it on the next device. */
const fieldHint = computed(() => {
  if (props.hint) return `Hint: ${props.hint}`
  if (props.pin === ConnectPin.SET_UP) return 'Remember it: the X app asks for it on every new device'
  return undefined
})

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
      :inputmode="pin ? 'numeric' : undefined"
      :label="label"
      :hint="fieldHint"
      :error="value ? undefined : error"
      data-test="connect-input"
      required
    />
    <SlbButton type="submit" :loading="busy" :disabled="!value.trim()">Continue</SlbButton>
  </form>
</template>
