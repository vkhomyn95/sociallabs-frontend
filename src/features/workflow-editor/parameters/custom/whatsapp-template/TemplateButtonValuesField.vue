<script setup lang="ts">
import { computed, watch } from 'vue'
import { childPath, elementPath } from '@/core/node-types/parameters'
import type { TemplateButtonStructure } from '@/components/credential/whatsapp-bot/whatsappBot.types'
import ExpressionInput from '../../../expression/ExpressionInput.vue'
import FixedCollectionField from '../../fields/FixedCollectionField.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import TemplateLookupNote from './TemplateLookupNote.vue'
import {
  BUTTON_VALUE_LABELS,
  TemplateLookup,
  buttonValueOf,
  buttonValuesFor,
  sameValues,
  valueButtonsOf,
  type ButtonValue,
} from './templateValues'
import { useTemplateStructure } from './useTemplateStructure'

/**
 * The values of a template's buttons. Once the template is known: one input per button that takes a value (a dynamic
 * URL's end, a code, a payload, a flow token), stored with the button's position and kind. Otherwise the plain list,
 * with why the template is not known.
 */
const props = defineProps<FieldProps<Record<string, unknown>[]>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>[]>>()

const VALUE = 'value'

const template = useTemplateStructure()
const language = computed(() => template.language.value)
const buttons = computed(() => {
  if (!language.value) return []
  return valueButtonsOf(language.value)
})
const values = computed<ButtonValue[]>(() => {
  if (!language.value) return []
  return buttonValuesFor(language.value, props.modelValue)
})

watch(
  values,
  (aligned) => {
    if (language.value && !sameValues(props.modelValue, aligned)) emit('update:modelValue', aligned)
  },
  { immediate: true },
)

function set(button: TemplateButtonStructure, value: string): void {
  const others = values.value.filter((entry) => entry.index !== button.index)
  const given = [...others, { index: button.index, type: button.valueKind, value }]
  emit('update:modelValue', buttonValuesFor(language.value!, given))
}

function titleOf(button: TemplateButtonStructure): string {
  const label = button.text ?? button.type
  return `Button ${button.index + 1} · ${label}`
}

function errorOf(button: TemplateButtonStructure): string | undefined {
  const at = values.value.findIndex((entry) => entry.index === button.index)
  if (at < 0) return undefined
  return props.issues.get(childPath(elementPath(props.path, at), VALUE))
}
</script>

<template>
  <div v-if="language" class="wa-template-buttons" data-test="template-buttons">
    <p v-if="buttons.length === 0" class="wa-template-buttons__empty">The template's buttons take no values</p>
    <label v-for="button in buttons" :key="button.index" class="wa-template-buttons__button">
      <span class="wa-template-buttons__title">
        {{ titleOf(button) }}
        <span v-if="button.valueRequired" class="wa-template-buttons__required">*</span>
      </span>
      <span class="wa-template-buttons__hint">
        {{ BUTTON_VALUE_LABELS[button.valueKind!] }}<template v-if="button.url">: {{ button.url }}</template>
      </span>
      <ExpressionInput
        :model-value="buttonValueOf(values, button.index)"
        :error="errorOf(button)"
        @update:model-value="set(button, $event)"
      />
    </label>
  </div>
  <div v-else class="wa-template-buttons">
    <TemplateLookupNote
      :lookup="template.lookup.value as Exclude<TemplateLookup, TemplateLookup.READY>"
      :error="template.error.value"
      :languages="template.languages.value"
      @reload="template.reload()"
    />
    <FixedCollectionField v-bind="props" @update:model-value="emit('update:modelValue', $event)" />
  </div>
</template>

<style scoped lang="scss">
.wa-template-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wa-template-buttons__empty {
  margin: 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wa-template-buttons__button {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wa-template-buttons__title {
  font-size: var(--slb-font-sm);
  color: var(--slb-color-text);
}

.wa-template-buttons__required {
  color: var(--slb-color-error);
}

.wa-template-buttons__hint {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  word-break: break-all;
}
</style>
