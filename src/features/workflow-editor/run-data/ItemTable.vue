<script setup lang="ts">
import { computed } from 'vue'
import { asTemplate, type DataPath } from '@/core/expression/paths'
import type { RunItem } from '@/core/execution/types'
import { MAPPING_FORMAT } from './runSources'

/** Items as rows and their top-level fields as columns. */
const props = defineProps<{
  items: readonly RunItem[]
  mapping?: (path: DataPath) => string
  limit: number
}>()

const rows = computed(() => props.items.slice(0, props.limit))
const columns = computed(() => {
  const keys = new Set<string>()
  rows.value.forEach((item) => Object.keys(item.json).forEach((key) => keys.add(key)))
  return [...keys]
})

const CELL_CHARS = 120

function cell(value: unknown): string {
  if (value === undefined) return ''
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > CELL_CHARS ? `${text.slice(0, CELL_CHARS)}…` : text
}

function onDragStart(event: DragEvent, key: string): void {
  if (!props.mapping || !event.dataTransfer) return
  event.dataTransfer.setData(MAPPING_FORMAT, asTemplate(props.mapping([key])))
}
</script>

<template>
  <div class="wf-items">
    <table>
      <thead>
        <tr>
          <th class="wf-items__index">#</th>
          <th v-for="key in columns" :key="key" :draggable="!!mapping" :class="{ mappable: mapping }" @dragstart="onDragStart($event, key)">
            {{ key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in rows" :key="index">
          <td class="wf-items__index">{{ index }}</td>
          <td v-for="key in columns" :key="key" :title="cell(item.json[key])">{{ cell(item.json[key]) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.wf-items {
  overflow: auto;

  table {
    min-width: 100%;
    font-size: var(--slb-font-xs);
    border-collapse: collapse;
  }

  th,
  td {
    max-width: 240px;
    padding: 4px 8px;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid var(--slb-color-border);
  }

  th {
    position: sticky;
    top: 0;
    font-weight: var(--slb-fw-medium);
    background: var(--slb-color-gray-50);

    &.mappable {
      cursor: grab;
    }
  }
}

.wf-items__index {
  width: 1%;
  color: var(--slb-color-text-muted);
}
</style>
