<script setup lang="ts">
import { SlbInput } from '@sociallabs/frontend-components'
import type { FieldEmits, FieldProps } from './fieldProps'

defineProps<FieldProps<number>>()
const emit = defineEmits<FieldEmits<number>>()

// An unfinished number ("-", "1e") is kept out of the parameters instead of being saved as NaN.
function set(text: string): void {
  if (text.trim() === '') return emit('update:modelValue', undefined)
  const value = Number(text)
  if (Number.isFinite(value)) emit('update:modelValue', value)
}
</script>

<template>
  <SlbInput
    type="number"
    :model-value="modelValue ?? null"
    :placeholder="property.placeholder"
    :error="issues.get(path)"
    size="sm"
    @update:model-value="set"
  />
</template>
