<template>
  <div class="tree-node" :class="{ 'tree-node--root': depth === 0 }">
    <!-- Node row -->
    <div
      class="tree-row"
      :class="{
        'tree-row--expandable': isObject || isArray,
        'tree-row--output': isOutput
      }"
      :style="{ paddingLeft: `${depth * 14}px` }"
      @click="toggle"
      :draggable="!isOutput && !isObject && !isArray"
      @dragstart="onDragStart"
    >
      <!-- Expand arrow -->
      <span class="arrow" :class="{ expanded, invisible: !isObject && !isArray }">
        <i class="fas fa-chevron-right"></i>
      </span>

      <!-- Key -->
      <span class="tree-key">{{ label }}</span>
      <span class="tree-colon">:</span>

      <!-- Value preview -->
      <span v-if="isArray" class="tree-meta">[{{ arrayLength }}]</span>
      <span v-else-if="isObject" class="tree-meta">{{ objectKeyCount }}</span>
      <span v-else class="tree-value" :class="`val-${valueType}`">{{ displayValue }}</span>

      <!-- Drag badge (non-output leaf nodes) -->
      <span v-if="!isOutput && !isObject && !isArray" class="drag-hint" title="Drag to parameter">
        <i class="fas fa-grip-vertical"></i>
      </span>

      <!-- Type badge -->
      <span class="type-badge" :class="`badge-${valueType}`">{{ valueType }}</span>
    </div>

    <!-- Children -->
    <template v-if="expanded">
      <template v-if="isArray">
        <JsonTreeNode
          v-for="(item, idx) in (value as any[])"
          :key="idx"
          :label="`${idx}`"
          :value="item"
          :path="`${path}[${idx}]`"
          :depth="depth + 1"
          :is-output="isOutput"
          @drag-field="$emit('drag-field', $event)"
        />
      </template>
      <template v-else-if="isObject">
        <JsonTreeNode
          v-for="(v, k) in (value as Record<string, any>)"
          :key="k"
          :label="String(k)"
          :value="v"
          :path="`${path}.${k}`"
          :depth="depth + 1"
          :is-output="isOutput"
          @drag-field="$emit('drag-field', $event)"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  label: string
  value: any
  path: string
  depth: number
  isOutput?: boolean
}

const props = withDefaults(defineProps<Props>(), { isOutput: false })
const emit = defineEmits<{ 'drag-field': [{ path: string; value: any }] }>()

const expanded = ref(props.depth < 1)

const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(() => props.value !== null && typeof props.value === 'object' && !Array.isArray(props.value))
const arrayLength = computed(() => isArray.value ? (props.value as any[]).length : 0)
const objectKeyCount = computed(() => isObject.value ? Object.keys(props.value as object).length : 0)

const valueType = computed(() => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  return typeof props.value
})

const displayValue = computed(() => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'string') return `"${props.value.length > 60 ? props.value.slice(0, 60) + '…' : props.value}"`
  return String(props.value)
})

function toggle() {
  if (isObject.value || isArray.value) expanded.value = !expanded.value
}

function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('text/plain', JSON.stringify({ path: props.path, value: props.value }))
  emit('drag-field', { path: props.path, value: props.value })
}
</script>

<style scoped>
.tree-node { user-select: none; }

.tree-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: default;
  transition: background 0.1s;
  min-height: 24px;
  position: relative;
}
.tree-row:hover { background: #1f2025; }
.tree-row--expandable { cursor: pointer; }
.tree-row--output:hover { background: #1a1f2e; }

.arrow {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  font-size: 8px;
  transition: transform 0.15s;
  flex-shrink: 0;
}
.arrow.expanded { transform: rotate(90deg); }
.arrow.invisible { opacity: 0; pointer-events: none; }

.tree-key {
  color: #93c5fd;
  font-size: 12px;
  flex-shrink: 0;
}
.tree-colon {
  color: #4b5563;
  font-size: 12px;
  flex-shrink: 0;
}

.tree-meta {
  color: #4b5563;
  font-size: 11px;
  font-style: italic;
}

.tree-value {
  font-size: 12px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.val-string { color: #86efac; }
.val-number { color: #fbbf24; }
.val-boolean { color: #f472b6; }
.val-null { color: #6b7280; font-style: italic; }

.drag-hint {
  opacity: 0;
  color: #4b5563;
  font-size: 10px;
  cursor: grab;
  transition: opacity 0.15s;
  margin-left: auto;
}
.tree-row:hover .drag-hint { opacity: 1; }

.type-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.tree-row:hover .type-badge { opacity: 1; }

.badge-string { background: #052e16; color: #86efac; }
.badge-number { background: #2d1b00; color: #fbbf24; }
.badge-boolean { background: #2d0a1f; color: #f472b6; }
.badge-null { background: #1f2025; color: #6b7280; }
.badge-object { background: #1e1f3a; color: #818cf8; }
.badge-array { background: #1e1f3a; color: #a78bfa; }
</style>
