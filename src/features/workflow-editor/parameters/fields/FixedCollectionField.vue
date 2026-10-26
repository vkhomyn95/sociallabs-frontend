<script setup lang="ts">
import { computed } from 'vue'
import { SlbButton, SlbIcon } from '@sociallabs/frontend-components'
import { defaultParameters, elementPath, isRecord } from '@/core/node-types/parameters'
import ParameterForm from '../ParameterForm.vue'
import type { FieldEmits, FieldProps } from './fieldProps'

/** A list of nested records (rules, conditions, headers); order matters, e.g. Switch rules are its outputs. */
const props = defineProps<FieldProps<Record<string, unknown>[]>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>[]>>()

const elements = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.map((e) => (isRecord(e) ? e : {})) : []))

function commit(next: Record<string, unknown>[]): void {
  emit('update:modelValue', next.length ? next : undefined)
}

const add = () => commit([...elements.value, defaultParameters(props.property.children)])
const remove = (index: number) => commit(elements.value.filter((_, i) => i !== index))
const replace = (index: number, value: Record<string, unknown>) => commit(elements.value.map((e, i) => (i === index ? value : e)))

function move(index: number, by: -1 | 1): void {
  const next = [...elements.value]
  const target = index + by
  if (target < 0 || target >= next.length) return
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  commit(next)
}
</script>

<template>
  <div class="wf-fixed-collection">
    <div v-for="(element, index) in elements" :key="index" class="wf-fixed-collection__element">
      <div class="wf-fixed-collection__header">
        <span>#{{ index + 1 }}</span>
        <div class="wf-fixed-collection__tools">
          <button type="button" title="Move up" :disabled="index === 0" @click="move(index, -1)">
            <SlbIcon name="arrow_up" :size="14" />
          </button>
          <button type="button" title="Move down" :disabled="index === elements.length - 1" @click="move(index, 1)">
            <SlbIcon name="arrow_down" :size="14" />
          </button>
          <button type="button" title="Remove" @click="remove(index)">
            <SlbIcon name="action_trash" :size="14" />
          </button>
        </div>
      </div>
      <ParameterForm
        :properties="property.children"
        :values="element"
        :path="elementPath(path, index)"
        :issues="issues"
        :type-key="typeKey"
        @update:values="replace(index, $event)"
      />
    </div>
    <SlbButton variant="secondary" size="sm" icon-left="action_plus" @click="add">Add {{ property.displayName.toLowerCase() }}</SlbButton>
  </div>
</template>

<style scoped lang="scss">
.wf-fixed-collection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.wf-fixed-collection__element {
  align-self: stretch;
  padding: 8px 12px 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}

.wf-fixed-collection__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-fixed-collection__tools {
  display: flex;
  gap: 2px;

  button {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    color: var(--slb-color-text-muted);
    background: none;
    border: 0;
    border-radius: var(--slb-radius-sm);
    cursor: pointer;

    &:hover:not(:disabled) {
      color: var(--slb-color-text);
      background: var(--slb-color-gray-100);
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
  }
}
</style>
