<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbInput, SlbSelect } from '@sociallabs/frontend-components'
import { choiceHint, choiceOptions } from '../options/loadedChoices'
import { useLoadedOptions } from '../options/useLoadedOptions'
import { ChoiceMode } from './choiceMode'
import type { FieldEmits, FieldProps } from './fieldProps'
import LoadedChoiceBar from './LoadedChoiceBar.vue'

/**
 * Text field whose choices are loaded from the server, e.g. the models of the selected API key: picked from the
 * list, or typed by ID for a value the list does not offer (a new model, a gateway's naming).
 */
const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

const mode = ref(ChoiceMode.LIST)
const { options: choices, loading, error, hasCredential, reload } = useLoadedOptions(
  () => props.typeKey,
  () => props.path,
)

const options = computed(() => choiceOptions(choices.value, props.modelValue))
const hint = computed(() =>
  hasCredential.value ? choiceHint(choices.value, props.modelValue) : 'Select a credential to load the list',
)
const placeholder = computed(() => (loading.value ? 'Loading…' : props.property.placeholder || 'Select…'))

const set = (value: unknown) => emit('update:modelValue', value === null || value === undefined || value === '' ? undefined : String(value))
</script>

<template>
  <div class="wf-loaded">
    <LoadedChoiceBar v-model:mode="mode" :can-reload="hasCredential" :loading="loading" @reload="reload" />

    <SlbSelect
      v-if="mode === ChoiceMode.LIST"
      :model-value="modelValue ?? null"
      :options="options"
      :placeholder="placeholder"
      :hint="hint"
      :error="error ?? issues.get(path)"
      :clearable="!property.required"
      :empty-text="hasCredential ? 'No choices' : 'Select a credential first'"
      searchable
      size="sm"
      @update:model-value="set"
    />
    <SlbInput
      v-else
      :model-value="modelValue ?? ''"
      :placeholder="property.placeholder || 'ID'"
      :error="issues.get(path)"
      size="sm"
      @update:model-value="set"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-loaded {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
