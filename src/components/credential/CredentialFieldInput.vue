<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbToggle } from '@sociallabs/frontend-components'
import type { SelectOption } from '@sociallabs/frontend-components'
import { FormFieldType } from '@/stores/credential/types'
import type { FormFieldSchema, FormValues } from '@/stores/credential/types'

const props = defineProps<{
  field: FormFieldSchema
  required: boolean
  editing: boolean
  error?: string
}>()

const model = defineModel<FormValues[string]>()

/** Native input type for text-like fields. */
const INPUT_TYPES: Partial<Record<FormFieldType, string>> = {
  [FormFieldType.TEXT]: 'text',
  [FormFieldType.PASSWORD]: 'password',
  [FormFieldType.URL]: 'url',
  [FormFieldType.NUMBER]: 'number',
}

const options = computed<SelectOption[]>(() => props.field.options.map(({ value, label }) => ({ value, label })))

// In edit mode a secret is never sent back, so its input starts empty.
const placeholder = computed(() =>
  props.editing && props.field.secret ? '•••••••• (unchanged)' : (props.field.placeholder ?? undefined),
)

const textModel = computed({
  get: () => (model.value == null ? '' : String(model.value)),
  set: (value: string) => (model.value = value),
})
</script>

<template>
  <SlbToggle
    v-if="field.type === FormFieldType.BOOLEAN"
    :model-value="Boolean(model)"
    :label="field.label"
    :description="field.hint ?? undefined"
    @update:model-value="model = $event"
  />

  <SlbSelect
    v-else-if="field.type === FormFieldType.SELECT"
    :model-value="(model as string | null) ?? null"
    :options="options"
    :label="field.label"
    :hint="field.hint ?? undefined"
    :error="error"
    :required="required"
    @update:model-value="model = $event as string"
  />

  <label v-else-if="field.type === FormFieldType.TEXTAREA" class="slb-cred-field">
    <span class="slb-cred-field__label">
      {{ field.label }}<span v-if="required" class="slb-cred-field__required"> *</span>
    </span>
    <textarea
      v-model="textModel"
      class="slb-cred-field__textarea"
      :class="{ 'slb-cred-field__textarea--error': error }"
      :placeholder="placeholder"
      spellcheck="false"
      autocomplete="off"
    />
    <span v-if="error" class="slb-cred-field__error">{{ error }}</span>
    <span v-else-if="field.hint" class="slb-cred-field__hint">{{ field.hint }}</span>
  </label>

  <SlbInput
    v-else
    v-model="textModel"
    :type="INPUT_TYPES[field.type] ?? 'text'"
    :label="field.label"
    :placeholder="placeholder"
    :hint="field.hint ?? undefined"
    :error="error"
    :required="required"
  />
</template>

<style lang="scss">
.slb-cred-field {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-xs);

  &__label {
    font-size: var(--slb-font-md);
    font-weight: var(--slb-fw-medium);
    color: var(--slb-color-gray-700);
  }
  &__required { color: var(--slb-color-error); }
  &__textarea {
    min-height: 88px;
    padding: var(--slb-space-sm) var(--slb-space-base);
    border: 1px solid var(--slb-color-border);
    border-radius: var(--slb-radius-md);
    font: inherit;
    font-size: var(--slb-font-base);
    resize: vertical;

    &:focus { outline: none; border-color: var(--slb-color-primary); box-shadow: 0 0 0 3px var(--slb-color-primary-ring); }
    &--error { border-color: var(--slb-color-error); }
  }
  &__hint { font-size: var(--slb-font-sm); color: var(--slb-color-text-muted); }
  &__error { font-size: var(--slb-font-sm); color: var(--slb-color-error); }
}
</style>
