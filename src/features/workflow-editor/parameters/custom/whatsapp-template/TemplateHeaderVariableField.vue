<script setup lang="ts">
import { computed, watch } from 'vue'
import StringField from '../../fields/StringField.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import { TemplateLookup, headerVariableOf, variableLabel } from './templateValues'
import { useTemplateStructure } from './useTemplateStructure'

/**
 * The name the header's value is sent with. Once the template is known it is taken from the header: its variable for
 * named variables, none for {{1}}.
 */
const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

const template = useTemplateStructure()
const language = computed(() => template.language.value)
const name = computed(() => {
  if (!language.value) return undefined
  return headerVariableOf(language.value)
})
const shown = computed(() => language.value?.header?.variable)

watch(
  [language, name, () => props.modelValue],
  () => {
    if (language.value && props.modelValue !== name.value) emit('update:modelValue', name.value)
  },
  { immediate: true },
)
</script>

<template>
  <span v-if="template.lookup.value === TemplateLookup.READY" class="wa-template-variable" data-test="header-variable">
    <template v-if="shown">{{ variableLabel(shown) }}</template>
    <template v-if="!name"> — filled by position</template>
  </span>
  <StringField v-else v-bind="props" @update:model-value="emit('update:modelValue', $event)" />
</template>

<style scoped lang="scss">
.wa-template-variable {
  font-family: var(--slb-font-mono, monospace);
  font-size: var(--slb-font-sm);
  color: var(--slb-color-text-muted);
}
</style>
