<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CredentialPicker from '@/components/credential/CredentialPicker.vue'
import { CredentialKind, useCredentialStore, type CredentialType } from '@/stores/credential'

/**
 * Credential of a node, limited to the types its descriptor accepts. Wraps the existing picker; the
 * credential system itself is unchanged.
 */
const props = defineProps<{
  types: readonly string[]
  required: boolean
  modelValue: number | null
}>()

const emit = defineEmits<{ 'update:modelValue': [id: number | null] }>()

const credentials = useCredentialStore()
onMounted(() => void credentials.LOAD_TYPES())

const KIND_LABELS: Record<CredentialKind, string> = {
  [CredentialKind.ACCOUNT]: 'Account',
  [CredentialKind.BOT]: 'Bot',
  [CredentialKind.AI_PROVIDER]: 'AI provider',
  [CredentialKind.GENERIC]: 'Credential',
}

const accepted = computed(() => props.types as CredentialType[])

// Name the field after the kind when all accepted types share one.
const label = computed(() => {
  const kinds = new Set(accepted.value.map((type) => credentials.typeDescriptor(type)?.kind))
  const [kind] = kinds
  return kinds.size === 1 && kind ? KIND_LABELS[kind] : 'Credential'
})

const model = computed({
  get: () => props.modelValue,
  set: (id: number | null | undefined) => emit('update:modelValue', id ?? null),
})
</script>

<template>
  <CredentialPicker v-model="model" :types="accepted" :required="required" :label="label" />
</template>
