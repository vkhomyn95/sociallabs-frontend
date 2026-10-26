<script setup lang="ts">
import { ref } from 'vue'
import type { DataPath } from '@/core/expression/paths'
import { FieldType, type SchemaField } from '@/core/execution/schema'
import { asTemplate } from '@/core/expression/paths'
import { MAPPING_FORMAT } from './runSources'

/** Fields of the item structure; mappable fields can be dragged into parameters as expressions. */
const props = defineProps<{
  fields: readonly SchemaField[]
  mapping?: (path: DataPath) => string
  depth?: number
}>()

const collapsed = ref(new Set<string>())

function toggle(key: string): void {
  const next = new Set(collapsed.value)
  if (!next.delete(key)) next.add(key)
  collapsed.value = next
}

function onDragStart(event: DragEvent, field: SchemaField): void {
  if (!props.mapping || !event.dataTransfer) return
  event.dataTransfer.setData(MAPPING_FORMAT, asTemplate(props.mapping(field.path)))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <ul class="wf-schema" :style="{ '--depth': depth ?? 0 }">
    <li v-for="field in fields" :key="field.key">
      <div class="wf-schema__row">
        <button v-if="field.children.length" type="button" class="wf-schema__toggle" @click="toggle(field.key)">
          {{ collapsed.has(field.key) ? '▸' : '▾' }}
        </button>
        <span v-else class="wf-schema__toggle" />
        <span
          class="wf-schema__key"
          :class="{ 'wf-schema__key--mappable': mapping }"
          :draggable="!!mapping"
          :title="mapping ? 'Drag into a parameter' : undefined"
          @dragstart="onDragStart($event, field)"
        >
          {{ field.key }}
        </span>
        <span class="wf-schema__type" :data-type="field.type">{{ field.type === FieldType.ARRAY ? '[ ]' : field.type }}</span>
        <span class="wf-schema__sample">{{ field.sample }}</span>
      </div>
      <SchemaTree
        v-if="field.children.length && !collapsed.has(field.key)"
        :fields="field.children"
        :mapping="mapping"
        :depth="(depth ?? 0) + 1"
      />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.wf-schema {
  margin: 0;
  padding: 0 0 0 calc(var(--depth) * 4px);
  list-style: none;
}

.wf-schema__row {
  display: flex;
  gap: 6px;
  align-items: center;
  min-height: 24px;
  font-size: var(--slb-font-xs);
}

.wf-schema__toggle {
  flex: none;
  width: 14px;
  padding: 0;
  color: var(--slb-color-text-muted);
  background: none;
  border: 0;
  cursor: pointer;
}

.wf-schema__key {
  padding: 1px 6px;
  font-family: var(--slb-font-mono, monospace);
  color: var(--slb-color-text);
  background: var(--slb-color-gray-100);
  border-radius: var(--slb-radius-sm);

  &--mappable {
    cursor: grab;

    &:hover {
      color: var(--slb-color-primary);
      background: var(--slb-color-primary-light, var(--slb-color-gray-100));
    }
  }
}

.wf-schema__type {
  font-size: 10px;
  color: var(--slb-color-text-muted);
}

.wf-schema__sample {
  overflow: hidden;
  color: var(--slb-color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
