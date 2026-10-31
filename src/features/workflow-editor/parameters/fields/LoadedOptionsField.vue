<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbIcon, SlbInput, SlbSelect } from '@sociallabs/frontend-components'
import { choiceHint, choiceOptions } from '../options/loadedChoices'
import { useLoadedOptions } from '../options/useLoadedOptions'
import type { FieldEmits, FieldProps } from './fieldProps'

/**
 * Text field whose choices are loaded from the server, e.g. the models of the selected API key: picked from the
 * list, or typed by ID for a value the list does not offer (a new model, a gateway's naming).
 */
const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

enum Mode {
  LIST = 'list',
  ID = 'id',
}

const mode = ref(Mode.LIST)
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
    <div class="wf-loaded__bar">
      <div class="wf-loaded__mode" role="group" aria-label="How to choose">
        <button type="button" :class="{ active: mode === Mode.LIST }" @click="mode = Mode.LIST">From list</button>
        <button type="button" :class="{ active: mode === Mode.ID }" @click="mode = Mode.ID">By ID</button>
      </div>
      <button
        v-if="mode === Mode.LIST && hasCredential"
        type="button"
        class="wf-loaded__refresh"
        :disabled="loading"
        title="Reload the list"
        @click="reload"
      >
        <SlbIcon name="action_refresh" :size="13" :class="{ spinning: loading }" />
      </button>
    </div>

    <SlbSelect
      v-if="mode === Mode.LIST"
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

.wf-loaded__bar {
  display: flex;
  gap: 6px;
  align-items: center;
}

.wf-loaded__mode {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-sm);

  button {
    padding: 1px 8px;
    font-size: 11px;
    color: var(--slb-color-text-muted);
    background: none;
    border: 0;
    cursor: pointer;

    &.active {
      color: var(--slb-color-primary);
      background: var(--slb-color-primary-light, var(--slb-color-gray-100));
    }
  }
}

.wf-loaded__refresh {
  display: inline-flex;
  padding: 2px;
  color: var(--slb-color-text-muted);
  background: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  .spinning {
    animation: wf-loaded-spin 0.8s linear infinite;
  }
}

@keyframes wf-loaded-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
