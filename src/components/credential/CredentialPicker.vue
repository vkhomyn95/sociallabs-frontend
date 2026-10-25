<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbButton, SlbIcon, SlbSelect } from '@sociallabs/frontend-components'
import type { SelectOption } from '@sociallabs/frontend-components'
import { CredentialService, CredentialStatus } from '@/stores/credential'
import type { Credential, CredentialType } from '@/stores/credential'
import CredentialCreateModal from './CredentialCreateModal.vue'
import { PLATFORM_UI, STATUS_UI, credentialHints } from './credential-ui'

/**
 * Select a credential compatible with a node. Options are loaded page by page from
 * the backend, filtered by the accepted types; a new credential can be connected inline.
 */
const props = withDefaults(defineProps<{
  /** Credential types the node accepts. */
  types: CredentialType[]
  required?: boolean
  label?: string
}>(), {
  required: false,
  label: 'Credential',
})

const model = defineModel<number | null | undefined>()

const source = computed(() => CredentialService.sourceForTypes(props.types))
const selected = ref<Credential | null>(null)
const createOpen = ref(false)
// Remounting the select after an inline create drops its cached first page.
const selectKey = ref(0)

const toOption = (credential: Credential): SelectOption => ({
  value: credential.id,
  label: [credential.name, ...credentialHints(credential, 1)].join(' · '),
  icon: PLATFORM_UI[credential.platform].icon,
})

const optionLabel = (credential: Credential): string => toOption(credential).label

// The async select only knows rows it has loaded; seed the current one so its label renders.
const seedOptions = computed<SelectOption[]>(() => (selected.value ? [toOption(selected.value)] : []))

const warning = computed(() => {
  const status = selected.value?.status
  if (!status || status === CredentialStatus.ACTIVE) return null
  return selected.value?.statusMessage ?? `Credential status: ${STATUS_UI[status].label}`
})

watch(
  model,
  async (id) => {
    if (id == null) {
      selected.value = null
      return
    }
    if (selected.value?.id === id) return
    try {
      selected.value = await CredentialService.get(id)
    } catch {
      selected.value = null
    }
  },
  { immediate: true },
)

function onCreated(credential: Credential): void {
  selected.value = credential
  model.value = credential.id
  selectKey.value++
}
</script>

<template>
  <div class="slb-cred-picker">
    <div class="slb-cred-picker__row">
      <SlbSelect
        :key="selectKey"
        :model-value="model ?? null"
        :source="source"
        :options="seedOptions"
        :option-label="optionLabel"
        option-value="id"
        :label="label"
        :required="required"
        placeholder="Select credential"
        empty-text="No matching credentials"
        searchable
        clearable
        @update:model-value="model = ($event as number | null)"
      />
      <SlbButton variant="secondary" icon-left="action_plus" @click="createOpen = true">New</SlbButton>
    </div>

    <span v-if="warning" class="slb-cred-picker__warning">
      <SlbIcon name="status_warning" :size="14" />
      {{ warning }}
    </span>

    <CredentialCreateModal v-model="createOpen" :types="types" @created="onCreated" />
  </div>
</template>

<style lang="scss">
.slb-cred-picker {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-xs);

  &__row {
    display: flex;
    align-items: flex-end;
    gap: var(--slb-space-sm);

    > :first-child { flex: 1; min-width: 0; }
  }
  &__warning {
    display: flex;
    align-items: center;
    gap: var(--slb-space-xs);
    font-size: var(--slb-font-sm);
    color: var(--slb-color-warning);
  }
}
</style>
