<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbButton, SlbModal } from '@sociallabs/frontend-components'
import { useCredentialStore } from '@/stores/credential'
import type { Credential } from '@/stores/credential'
import CredentialForm from './CredentialForm.vue'
import { CREDENTIAL_PANELS } from './credential-panels'

/** Edit name, description and (for form types) the secret data of a credential. */
const props = defineProps<{ credential: Credential | null }>()

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ saved: [credential: Credential] }>()

const store = useCredentialStore()
const formRef = ref<InstanceType<typeof CredentialForm> | null>(null)

const descriptor = computed(() => (props.credential ? store.typeDescriptor(props.credential.type) : undefined))
const panel = computed(() => (props.credential ? CREDENTIAL_PANELS[props.credential.type] : null))

watch(open, (isOpen) => isOpen && void store.LOAD_TYPES(), { immediate: true })

function onSaved(credential: Credential): void {
  emit('saved', credential)
  open.value = false
}
</script>

<template>
  <SlbModal v-model="open" :title="credential ? `Edit ${credential.name}` : 'Edit'" size="lg" :close-on-backdrop="false">
    <CredentialForm
      v-if="credential && descriptor"
      :key="credential.id"
      ref="formRef"
      :descriptor="descriptor"
      :credential="credential"
      @saved="onSaved"
    />
    <component :is="panel" v-if="credential && panel" :key="`panel-${credential.id}`" :credential="credential" />

    <template #footer>
      <SlbButton variant="ghost" @click="open = false">Cancel</SlbButton>
      <SlbButton icon-left="action_save" :loading="formRef?.busy" :disabled="!formRef?.canSubmit" @click="formRef?.submit()">
        Save
      </SlbButton>
    </template>
  </SlbModal>
</template>
