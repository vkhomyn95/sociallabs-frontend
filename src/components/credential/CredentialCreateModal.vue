<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbButton, SlbModal } from '@sociallabs/frontend-components'
import { SetupMode, useCredentialStore } from '@/stores/credential'
import type { Credential, CredentialKind, CredentialType, CredentialTypeDescriptor } from '@/stores/credential'
import CredentialTypePicker from './CredentialTypePicker.vue'
import CredentialForm from './CredentialForm.vue'
import AccountConnectFlow from './connect/AccountConnectFlow.vue'
import { ConnectView } from './connect/connect.types'
import { KIND_UI } from './credential-ui'

/**
 * Add a credential: pick a type (skipped when only one fits), then fill the form
 * or go through the interactive account connection.
 */
const props = defineProps<{
  /** Restrict to one kind (credential pages). */
  kind?: CredentialKind
  /** Restrict to specific types (node editor). */
  types?: CredentialType[]
}>()

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ created: [credential: Credential] }>()

const store = useCredentialStore()
const selected = ref<CredentialTypeDescriptor | null>(null)
const formRef = ref<InstanceType<typeof CredentialForm> | null>(null)
const connectRef = ref<InstanceType<typeof AccountConnectFlow> | null>(null)

const candidates = computed(() =>
  store.types.filter((d) => (!props.kind || d.kind === props.kind) && (!props.types || props.types.includes(d.type))),
)
const available = computed(() => candidates.value.filter((d) => d.available))
const canGoBack = computed(() => candidates.value.length > 1 && !!selected.value)

const title = computed(() => {
  if (selected.value) return selected.value.displayName
  return props.kind ? KIND_UI[props.kind].addLabel : 'Add credential'
})

const isInteractive = computed(() => selected.value?.setupMode === SetupMode.INTERACTIVE)
const connectView = computed(() => connectRef.value?.view)

watch(open, async (isOpen) => {
  if (!isOpen) return
  await store.LOAD_TYPES()
  // A single option needs no picker.
  selected.value = available.value.length === 1 && candidates.value.length === 1 ? available.value[0]! : null
}, { immediate: true })

function onSaved(credential: Credential): void {
  emit('created', credential)
  void store.LOAD_SUMMARY()
  open.value = false
}

function onConnected(credential: Credential): void {
  emit('created', credential)
  void store.LOAD_SUMMARY()
}

function close(): void {
  open.value = false
}
</script>

<template>
  <SlbModal v-model="open" :title="title" size="lg" :close-on-backdrop="false" @close="selected = null">
    <CredentialTypePicker v-if="!selected" :types="candidates" @select="selected = $event" />

    <AccountConnectFlow v-else-if="isInteractive" ref="connectRef" :descriptor="selected" @connected="onConnected" />

    <CredentialForm v-else ref="formRef" :descriptor="selected" @saved="onSaved" />

    <template v-if="selected" #footer>
      <SlbButton v-if="canGoBack && connectView !== ConnectView.SUCCESS" variant="ghost" icon-left="arrow_back" @click="selected = null">
        Back
      </SlbButton>

      <template v-if="isInteractive">
        <SlbButton v-if="connectView === ConnectView.ERROR" variant="secondary" icon-left="action_refresh" @click="connectRef?.retry()">
          Try again
        </SlbButton>
        <SlbButton v-if="connectView === ConnectView.SUCCESS" @click="close">Done</SlbButton>
        <SlbButton
          v-else-if="connectView === ConnectView.PARAMS"
          icon-left="action_qrcode"
          :loading="connectRef?.busy"
          :disabled="!connectRef?.canStart"
          @click="connectRef?.connect()"
        >
          Connect
        </SlbButton>
        <SlbButton v-else variant="ghost" @click="close">Cancel</SlbButton>
      </template>

      <SlbButton
        v-else
        icon-left="action_save"
        :loading="formRef?.busy"
        :disabled="!formRef?.canSubmit"
        @click="formRef?.submit()"
      >
        Save
      </SlbButton>
    </template>
  </SlbModal>
</template>
