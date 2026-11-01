<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbSelect, type SelectValue } from '@sociallabs/frontend-components'
import { choiceListOptions } from '../options/loadedChoices'
import { useLoadedOptions } from '../options/useLoadedOptions'
import { ChoiceMode } from './choiceMode'
import type { FieldEmits, FieldProps } from './fieldProps'
import LoadedChoiceBar from './LoadedChoiceBar.vue'
import { listValue } from './stringList'
import StringListField from './StringListField.vue'

/**
 * Several texts whose choices are loaded from the server, e.g. the account's chats: picked from the list, or typed
 * by id for chats the list does not offer. Both modes edit the same list, so ids typed stay picked in the list.
 */
const props = defineProps<FieldProps<string[]>>()
const emit = defineEmits<FieldEmits<string[]>>()

const mode = ref(ChoiceMode.LIST)
const { options: choices, loading, error, hasCredential, reload } = useLoadedOptions(
  () => props.typeKey,
  () => props.path,
)

const values = computed<string[]>(() => props.modelValue ?? [])
const options = computed(() => choiceListOptions(choices.value, values.value))
const placeholder = computed(() => (loading.value ? 'Loading…' : props.property.placeholder || 'Select…'))
const hint = computed(() => (hasCredential.value ? undefined : 'Select a credential to load the list'))

function set(value: SelectValue | SelectValue[] | null): void {
  const picked = Array.isArray(value) ? value.map(String) : []
  emit('update:modelValue', listValue(picked))
}
</script>

<template>
  <div class="wf-loaded-list">
    <LoadedChoiceBar v-model:mode="mode" :can-reload="hasCredential" :loading="loading" @reload="reload" />

    <SlbSelect
      v-if="mode === ChoiceMode.LIST"
      multiple
      searchable
      :model-value="values"
      :options="options"
      :placeholder="placeholder"
      :hint="hint"
      :error="error ?? issues.get(path)"
      :empty-text="hasCredential ? 'No choices' : 'Select a credential first'"
      size="sm"
      @update:model-value="set"
    />
    <StringListField
      v-else
      :property="property"
      :model-value="modelValue"
      :path="path"
      :issues="issues"
      :type-key="typeKey"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-loaded-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
