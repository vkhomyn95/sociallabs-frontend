<script setup lang="ts">
import { computed } from 'vue'
import { SlbSelect, type SelectOption } from '@sociallabs/frontend-components'
import type { FieldEmits, FieldProps } from './fieldProps'

const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

const options = computed<SelectOption[]>(() => props.property.options.map((o) => ({ value: o.value, label: o.displayName })))
const hint = computed(() => props.property.options.find((o) => o.value === props.modelValue)?.description || undefined)
</script>

<template>
  <SlbSelect
    :model-value="modelValue ?? null"
    :options="options"
    :clearable="!property.required"
    :placeholder="property.placeholder || 'Select…'"
    :hint="hint"
    :error="issues.get(path)"
    size="sm"
    @update:model-value="emit('update:modelValue', $event == null ? undefined : String($event))"
  />
</template>
