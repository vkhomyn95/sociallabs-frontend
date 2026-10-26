<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FieldEmits, FieldProps } from './fieldProps'

/** Free-form JSON; the text is kept while it does not parse, the value only changes when it does. */
const props = defineProps<FieldProps<unknown>>()
const emit = defineEmits<FieldEmits<unknown>>()

const format = (value: unknown): string => (value === undefined ? '' : JSON.stringify(value, null, 2))
const text = ref(format(props.modelValue))
const parseError = ref<string | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    // Follow outside changes (undo) without reformatting what is being typed.
    if (parseError.value === null && format(value) !== format(tryParse(text.value))) text.value = format(value)
  },
)

function tryParse(source: string): unknown {
  try {
    return source.trim() ? JSON.parse(source) : undefined
  } catch {
    return undefined
  }
}

function onInput(source: string): void {
  text.value = source
  if (!source.trim()) {
    parseError.value = null
    return emit('update:modelValue', undefined)
  }
  try {
    const value: unknown = JSON.parse(source)
    parseError.value = null
    emit('update:modelValue', value)
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : 'Invalid JSON'
  }
}
</script>

<template>
  <div class="wf-json-field">
    <textarea
      class="wf-json-field__input"
      :class="{ 'wf-json-field__input--error': parseError || issues.get(path) }"
      :value="text"
      :placeholder="property.placeholder || '{ }'"
      rows="5"
      spellcheck="false"
      @input="onInput(($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="parseError || issues.get(path)" class="wf-json-field__error">{{ parseError ?? issues.get(path) }}</span>
  </div>
</template>

<style scoped lang="scss">
.wf-json-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wf-json-field__input {
  width: 100%;
  padding: 8px 10px;
  font-family: var(--slb-font-mono, monospace);
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text);
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
  resize: vertical;

  &:focus {
    border-color: var(--slb-color-primary);
    outline: none;
  }

  &--error {
    border-color: var(--slb-color-error);
  }
}

.wf-json-field__error {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-error);
}
</style>
