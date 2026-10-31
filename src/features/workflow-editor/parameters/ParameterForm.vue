<script setup lang="ts">
import { computed } from 'vue'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import { childPath, effectiveValue, isVisible, offeredOptions, reconcileChoices, type FieldPath } from '@/core/node-types/parameters'
import ParameterField from './ParameterField.vue'

/**
 * Form of a node's parameters generated from its property descriptors; nested collections render nested
 * forms. Every change emits the whole new record, never a mutation. Choices that depend on a sibling (the operations
 * of the chosen resource) are narrowed here, so fields stay unaware of each other, and kept valid on every change.
 */
const props = withDefaults(
  defineProps<{
    properties: readonly PropertyDescriptor[]
    values: Readonly<Record<string, unknown>>
    typeKey: string
    path?: FieldPath
    issues?: ReadonlyMap<FieldPath, string>
  }>(),
  { path: '', issues: () => new Map() },
)

const emit = defineEmits<{ 'update:values': [values: Record<string, unknown>] }>()

const visible = computed(() =>
  props.properties
    .filter((p) => isVisible(p, props.values, props.properties))
    .map((p) => (p.optionsFilteredBy ? { ...p, options: [...offeredOptions(p, props.values, props.properties)] } : p)),
)

function set(name: string, value: unknown): void {
  const next: Record<string, unknown> = { ...props.values }
  if (value === undefined) delete next[name]
  else next[name] = value
  emit('update:values', { ...reconcileChoices(props.properties, next) })
}
</script>

<template>
  <div class="wf-parameter-form">
    <ParameterField
      v-for="property in visible"
      :key="property.name"
      :property="property"
      :model-value="effectiveValue(property, values)"
      :path="childPath(path, property.name)"
      :issues="issues"
      :type-key="typeKey"
      @update:model-value="set(property.name, $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-parameter-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
