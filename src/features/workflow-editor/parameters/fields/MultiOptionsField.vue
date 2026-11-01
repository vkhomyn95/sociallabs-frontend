<script setup lang="ts">
import { computed } from 'vue'
import { SlbSelect, type SelectOption } from '@sociallabs/frontend-components'
import type { FieldEmits, FieldProps } from './fieldProps'
import { selectOptionOf } from './selectOptions'

const props = defineProps<FieldProps<string[]>>()
const emit = defineEmits<FieldEmits<string[]>>()

const options = computed<SelectOption[]>(() => props.property.options.map(selectOptionOf))

function set(value: unknown): void {
  const list = Array.isArray(value) ? value.map(String) : []
  emit('update:modelValue', list.length ? list : undefined)
}
</script>

<template>
  <SlbSelect
    multiple
    :model-value="modelValue ?? []"
    :options="options"
    :placeholder="property.placeholder || 'Select…'"
    :error="issues.get(path)"
    size="sm"
    @update:model-value="set"
  />
</template>
