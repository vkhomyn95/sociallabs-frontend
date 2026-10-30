<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbButton, SlbDropdown, type MenuItem } from '@sociallabs/frontend-components'
import { isRecord } from '@/core/node-types/parameters'
import ParameterForm from '../ParameterForm.vue'
import { addableChildren, isRemovable, shownChildren, withAddedOption } from '../collection/collectionOptions'
import type { FieldEmits, FieldProps } from './fieldProps'

/**
 * A nested record edited like n8n's "Options": only the options that are set (or required) are shown, the rest are
 * added from a menu, and an optional one can be removed again, which drops its value.
 */
const props = defineProps<FieldProps<Record<string, unknown>>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>>>()

/** Options added but not filled in yet; they stay on show until removed. */
const added = ref<ReadonlySet<string>>(new Set())

const values = computed(() => (isRecord(props.modelValue) ? props.modelValue : {}))
const shown = computed(() => shownChildren(props.property.children, values.value, added.value))
const menu = computed<MenuItem[]>(() =>
  addableChildren(props.property.children, shown.value).map((child) => ({ key: child.name, label: child.displayName })),
)

const set = (next: Record<string, unknown>) => emit('update:modelValue', Object.keys(next).length ? next : undefined)

function add(item: MenuItem): void {
  added.value = new Set([...added.value, item.key])
  const child = props.property.children.find((candidate) => candidate.name === item.key)
  if (child) set(withAddedOption(values.value, child))
}

function remove(name: string): void {
  added.value = new Set([...added.value].filter((key) => key !== name))
  set(Object.fromEntries(Object.entries(values.value).filter(([key]) => key !== name)))
}
</script>

<template>
  <div class="wf-collection">
    <p v-if="!shown.length" class="wf-collection__empty">No options set</p>
    <div v-for="child in shown" :key="child.name" class="wf-collection__row">
      <ParameterForm
        class="wf-collection__field"
        :properties="[child]"
        :values="values"
        :path="path"
        :issues="issues"
        :type-key="typeKey"
        @update:values="set"
      />
      <SlbButton
        v-if="isRemovable(child)"
        variant="ghost"
        size="sm"
        icon-only
        icon-left="action_close"
        :aria-label="`Remove ${child.displayName}`"
        @click="remove(child.name)"
      />
    </div>
    <SlbDropdown v-if="menu.length" :items="menu" placement="bottom-start" @select="add">
      <SlbButton variant="secondary" size="sm" icon-left="action_plus">Add option</SlbButton>
    </SlbDropdown>
  </div>
</template>

<style scoped lang="scss">
.wf-collection {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}

.wf-collection__row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.wf-collection__field {
  flex: 1;
  min-width: 0;
}

.wf-collection__empty {
  margin: 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
