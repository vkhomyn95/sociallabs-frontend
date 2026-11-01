<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { FieldEmits, FieldProps } from './fieldProps'
import { entriesOf, listValue, withEntries } from './stringList'

/**
 * Several texts as tags: Enter or a comma adds what was typed, pasting a list adds each entry, Backspace on an empty
 * input removes the last tag. Repeats are ignored.
 */
const props = defineProps<FieldProps<string[]>>()
const emit = defineEmits<FieldEmits<string[]>>()

const draft = ref('')
const input = ref<HTMLInputElement>()
const tags = computed<string[]>(() => props.modelValue ?? [])
const error = computed(() => props.issues.get(props.path))

function commit(text: string): void {
  const entries = entriesOf(text)
  draft.value = ''
  if (entries.length) emit('update:modelValue', listValue(withEntries(tags.value, entries)))
}

function remove(index: number): void {
  emit('update:modelValue', listValue(tags.value.filter((_, i) => i !== index)))
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commit(draft.value)
    return
  }
  if (event.key === 'Backspace' && draft.value === '' && tags.value.length) remove(tags.value.length - 1)
}

function onPaste(event: ClipboardEvent): void {
  const text = event.clipboardData?.getData('text') ?? ''
  if (entriesOf(text).length < 2) return
  event.preventDefault()
  commit(text)
}
</script>

<template>
  <div class="wf-tags-field">
    <div class="wf-tags" :class="{ 'wf-tags--error': error }" @click="input?.focus()">
      <span v-for="(tag, index) in tags" :key="tag" class="wf-tags__tag">
        {{ tag }}
        <button type="button" class="wf-tags__remove" :aria-label="`Remove ${tag}`" @click.stop="remove(index)">
          <SlbIcon name="action_close" :size="11" :stroke="2" />
        </button>
      </span>
      <input
        ref="input"
        v-model="draft"
        class="wf-tags__input"
        :placeholder="tags.length ? '' : property.placeholder || 'Type and press Enter'"
        @keydown="onKeydown"
        @paste="onPaste"
        @blur="commit(draft)"
      />
    </div>
    <span v-if="error" class="wf-tags-field__error">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
.wf-tags-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wf-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 32px;
  padding: 3px 6px;
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-sm);
  cursor: text;

  &:focus-within {
    border-color: var(--slb-color-primary);
  }

  &--error {
    border-color: var(--slb-color-error);
  }
}

.wf-tags__tag {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  padding: 1px 4px 1px 8px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-gray-800);
  background: var(--slb-color-gray-100);
  border-radius: var(--slb-radius-sm);
}

.wf-tags__remove {
  display: inline-flex;
  padding: 1px;
  color: var(--slb-color-gray-500);
  background: none;
  border: 0;
  cursor: pointer;

  &:hover {
    color: var(--slb-color-gray-900);
  }
}

.wf-tags__input {
  flex: 1;
  min-width: 80px;
  padding: 2px;
  font-size: var(--slb-font-sm);
  font-family: inherit;
  background: transparent;
  border: 0;
  outline: none;
}

.wf-tags-field__error {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-error);
}
</style>
