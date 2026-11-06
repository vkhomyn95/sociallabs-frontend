<script setup lang="ts">
import { computed, watch } from 'vue'
import OptionsField from '../../fields/OptionsField.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import TemplateText from './TemplateText.vue'
import { TemplateHeaderType, TemplateLookup, headerTypeOf } from './templateValues'
import { useTemplateStructure } from './useTemplateStructure'

/**
 * The header value a template is sent with. Once the template is known it decides: the field shows the template's
 * header and keeps the stored kind in step, so only the matching header fields are offered.
 */
const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

const LABELS: Readonly<Record<TemplateHeaderType, string>> = {
  [TemplateHeaderType.NONE]: 'Nothing to fill in',
  [TemplateHeaderType.TEXT]: 'A text',
  [TemplateHeaderType.IMAGE]: 'An image',
  [TemplateHeaderType.VIDEO]: 'A video',
  [TemplateHeaderType.DOCUMENT]: 'A document',
  [TemplateHeaderType.LOCATION]: 'A location',
}

const template = useTemplateStructure()
const ready = computed(() => template.lookup.value === TemplateLookup.READY)
const header = computed(() => template.language.value?.header)
const kind = computed(() => headerTypeOf(header.value))

watch(
  [ready, kind, () => props.modelValue],
  () => {
    if (ready.value && props.modelValue !== kind.value) emit('update:modelValue', kind.value)
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="ready" class="wa-template-header" data-test="template-header">
    <span class="wa-template-header__kind">{{ LABELS[kind] }}</span>
    <TemplateText v-if="header?.text" :text="header.text" />
    <span v-else-if="!header" class="wa-template-header__none">The template has no header</span>
  </div>
  <OptionsField v-else v-bind="props" @update:model-value="emit('update:modelValue', $event)" />
</template>

<style scoped lang="scss">
.wa-template-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--slb-font-sm);
}

.wa-template-header__kind {
  color: var(--slb-color-text);
}

.wa-template-header__none {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
