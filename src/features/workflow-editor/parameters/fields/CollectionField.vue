<script setup lang="ts">
import { computed } from 'vue'
import { isRecord } from '@/core/node-types/parameters'
import ParameterForm from '../ParameterForm.vue'
import type { FieldEmits, FieldProps } from './fieldProps'

/** A nested record edited as a group of fields. */
const props = defineProps<FieldProps<Record<string, unknown>>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>>>()

const values = computed(() => (isRecord(props.modelValue) ? props.modelValue : {}))

const set = (next: Record<string, unknown>) => emit('update:modelValue', Object.keys(next).length ? next : undefined)
</script>

<template>
  <div class="wf-collection">
    <ParameterForm
      :properties="property.children"
      :values="values"
      :path="path"
      :issues="issues"
      :type-key="typeKey"
      @update:values="set"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-collection {
  padding: 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}
</style>
