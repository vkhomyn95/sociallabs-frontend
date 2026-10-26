<script setup lang="ts">
import { SlbInput } from '@sociallabs/frontend-components'
import ExpressionInput from '../../expression/ExpressionInput.vue'
import type { FieldEmits, FieldProps } from './fieldProps'

/** Text parameter; with expressions allowed it is a template input with completions and preview. */
const props = defineProps<FieldProps<string>>()
const emit = defineEmits<FieldEmits<string>>()

const set = (value: string) => emit('update:modelValue', value === '' ? undefined : value)
</script>

<template>
  <ExpressionInput
    v-if="property.expression"
    :model-value="modelValue ?? ''"
    :placeholder="property.placeholder"
    :error="issues.get(path)"
    @update:model-value="set"
  />
  <SlbInput
    v-else
    :model-value="props.modelValue ?? ''"
    :placeholder="property.placeholder"
    :error="issues.get(path)"
    size="sm"
    @update:model-value="set"
  />
</template>
