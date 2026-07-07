<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  label:    string
  value:    any
  path:     string
  depth:    number
  isOutput?: boolean
}

const props = withDefaults(defineProps<Props>(), { isOutput: false })
const emit  = defineEmits<{ 'drag-field': [{ path: string; value: any }] }>()

const expanded = ref(props.depth < 1)

const isArray  = computed(() => Array.isArray(props.value))
const isObject = computed(() =>
  props.value !== null && typeof props.value === 'object' && !Array.isArray(props.value)
)
const isExpandable = computed(() => isArray.value || isObject.value)

const valueType = computed((): string => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  return typeof props.value
})

const typeIcon = computed(() => {
  switch (valueType.value) {
    case 'string':  return 'T'
    case 'number':  return '#'
    case 'boolean': return '!'
    case 'object':  return '{}'
    case 'array':   return '[]'
    default:        return '∅'
  }
})

const preview = computed(() => {
  if (props.value === null) return 'null'
  if (isArray.value)  return `Array [${(props.value as any[]).length}]`
  if (isObject.value) return `{${Object.keys(props.value as object).length} keys}`
  if (typeof props.value === 'string')
    return `"${props.value.length > 50 ? props.value.slice(0, 50) + '…' : props.value}"`
  return String(props.value)
})

const previewClass = computed(() => {
  if (isExpandable.value) return 'slb-ned__schema-preview--meta'
  return `slb-ned__schema-preview--${valueType.value}`
})

function toggle() {
  if (isExpandable.value) expanded.value = !expanded.value
}

function onDragStart(e: DragEvent) {
  if (props.isOutput || isExpandable.value) return
  e.dataTransfer?.setData('text/plain', JSON.stringify({ path: props.path, value: props.value }))
  emit('drag-field', { path: props.path, value: props.value })
}
</script>

<template>
  <div class="slb-ned__schema-node">
    <div
      class="slb-ned__schema-row"
      :class="{ 'slb-ned__schema-row--draggable': !isOutput && !isExpandable }"
      :style="{ paddingLeft: `${depth * 14 + 4}px` }"
      :draggable="!isOutput && !isExpandable"
      @click="toggle"
      @dragstart="onDragStart"
    >
      <!-- Expand arrow -->
      <span
        class="slb-ned__schema-arrow"
        :class="{
          'slb-ned__schema-arrow--open':   expanded && isExpandable,
          'slb-ned__schema-arrow--hidden': !isExpandable,
        }"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </span>

      <!-- Type icon -->
      <span class="slb-ned__schema-type-icon" :class="`slb-ned__schema-type-icon--${valueType}`">
        {{ typeIcon }}
      </span>

      <!-- Key -->
      <span class="slb-ned__schema-key">{{ label }}</span>
      <span class="slb-ned__schema-colon">:</span>

      <!-- Preview -->
      <span class="slb-ned__schema-preview" :class="previewClass">{{ preview }}</span>

      <!-- Drag hint -->
      <span v-if="!isOutput && !isExpandable" class="slb-ned__schema-drag">
        <i class="fas fa-grip-vertical"></i>
      </span>
    </div>

    <!-- Children -->
    <template v-if="expanded && isExpandable">
      <template v-if="isArray">
        <NodeEditorSchemaNode
          v-for="(item, idx) in (value as any[])"
          :key="idx"
          :label="`${label}[${idx}]`"
          :value="item"
          :path="`${path}[${idx}]`"
          :depth="depth + 1"
          :is-output="isOutput"
          @drag-field="$emit('drag-field', $event)"
        />
      </template>
      <template v-else-if="isObject">
        <NodeEditorSchemaNode
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

<style lang="scss">
@use './node-editor.scss';
</style>
