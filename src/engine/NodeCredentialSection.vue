<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNodeStore } from '@/stores/node'
import type { NodeInstance } from '@/stores/node/types'
import { CredentialKind, useCredentialStore } from '@/stores/credential'
import CredentialPicker from '@/components/credential/CredentialPicker.vue'

/**
 * Credential selector of the node editor. Accepted types come from the backend node
 * registry, so a node only offers credentials it can actually use.
 */
const props = defineProps<{ node: NodeInstance }>()
const emit = defineEmits<{ 'update:node': [NodeInstance] }>()

const nodeStore = useNodeStore()
const credentialStore = useCredentialStore()

const metadata = computed(() => nodeStore.metadataOf(props.node.discriminator))
const types = computed(() => metadata.value?.credentialTypes ?? [])

const KIND_LABELS: Record<CredentialKind, string> = {
  [CredentialKind.ACCOUNT]: 'Account',
  [CredentialKind.BOT]: 'Bot',
  [CredentialKind.AI_PROVIDER]: 'AI provider',
  [CredentialKind.GENERIC]: 'Credential',
}

// Name the field after the kind when all accepted types share one.
const label = computed(() => {
  const kinds = new Set(types.value.map((type) => credentialStore.typeDescriptor(type)?.kind))
  const [kind] = kinds
  return kinds.size === 1 && kind ? KIND_LABELS[kind] : 'Credential'
})

const credentialId = computed({
  get: () => props.node.credentialId ?? null,
  set: (id: number | null) => emit('update:node', { ...props.node, credentialId: id ?? undefined }),
})

onMounted(async () => {
  await Promise.all([
    nodeStore.availableNodes ? Promise.resolve() : nodeStore.FETCH_AVAILABLE_NODES(),
    credentialStore.LOAD_TYPES(),
  ])
})
</script>

<template>
  <section v-if="types.length" class="slb-ned__credential">
    <CredentialPicker v-model="credentialId" :types="types" :required="metadata?.credentialRequired" :label="label" />
  </section>
</template>

<style lang="scss">
.slb-ned__credential {
  padding-bottom: var(--slb-space-base);
  border-bottom: 1px solid var(--slb-color-border);
}
</style>
