<script setup lang="ts">
import { SlbToggle } from '@sociallabs/frontend-components'
import type { FieldEmits, FieldProps } from './fieldProps'

defineProps<FieldProps<boolean>>()
const emit = defineEmits<FieldEmits<boolean>>()
</script>

<template>
  <SlbToggle :model-value="modelValue === true" size="sm" @update:model-value="emit('update:modelValue', $event)" />
</template>
