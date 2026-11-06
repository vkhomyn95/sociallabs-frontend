<script setup lang="ts">
import { computed, watch } from 'vue'
import { SlbBadge } from '@sociallabs/frontend-components'
import { childPath, elementPath } from '@/core/node-types/parameters'
import ExpressionInput from '../../../expression/ExpressionInput.vue'
import FixedCollectionField from '../../fields/FixedCollectionField.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import TemplateLookupNote from './TemplateLookupNote.vue'
import TemplateText from './TemplateText.vue'
import { TemplateLookup, bodyValuesFor, sameValues, variableLabel, type BodyValue } from './templateValues'
import { useTemplateStructure } from './useTemplateStructure'

/**
 * The values of a template's body variables. Once the template is known: its body with the variables marked, and one
 * input per variable, stored in the template's order (and by name for named variables). Otherwise the plain list, with
 * why the template is not known.
 */
const props = defineProps<FieldProps<Record<string, unknown>[]>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>[]>>()

const VALUE = 'value'

const template = useTemplateStructure()
const language = computed(() => template.language.value)
const values = computed<BodyValue[]>(() => {
  if (!language.value) return []
  return bodyValuesFor(language.value, props.modelValue)
})

// Values left from another template, or a list not yet in its order, are brought in line with the template
watch(
  values,
  (aligned) => {
    if (language.value && !sameValues(props.modelValue, aligned)) emit('update:modelValue', aligned)
  },
  { immediate: true },
)

function set(index: number, value: string): void {
  const next = values.value.map((entry, at) => (at === index ? { ...entry, value } : entry))
  emit('update:modelValue', next)
}

const errorOf = (index: number): string | undefined => props.issues.get(childPath(elementPath(props.path, index), VALUE))
</script>

<template>
  <div v-if="language" class="wa-template-body" data-test="template-body">
    <div class="wa-template-body__badges">
      <SlbBadge color="gray">{{ language.language }}</SlbBadge>
      <SlbBadge v-if="language.category" color="gray">{{ language.category }}</SlbBadge>
      <SlbBadge v-if="!language.approved" color="warning" data-test="not-approved">
        {{ language.status ?? 'Not approved' }}: Meta refuses to send it
      </SlbBadge>
    </div>
    <TemplateText v-if="language.body.text" :text="language.body.text" />
    <p v-if="values.length === 0" class="wa-template-body__empty">The body has no variables</p>
    <label v-for="(entry, index) in values" :key="index" class="wa-template-body__variable">
      <span class="wa-template-body__name">{{ variableLabel(language.body.variables[index]!) }}</span>
      <ExpressionInput
        :model-value="entry.value ?? ''"
        :error="errorOf(index)"
        @update:model-value="set(index, $event)"
      />
    </label>
  </div>
  <div v-else class="wa-template-body">
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
.wa-template-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wa-template-body__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.wa-template-body__empty {
  margin: 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wa-template-body__variable {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wa-template-body__name {
  font-family: var(--slb-font-mono, ui-monospace, monospace);
  font-size: var(--slb-font-xs);
  color: var(--slb-color-primary);
}
</style>
