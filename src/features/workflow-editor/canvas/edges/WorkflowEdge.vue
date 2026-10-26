<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Position } from '@vue-flow/core'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { CanvasEdgeData } from '../canvasModel'

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  data: CanvasEdgeData
  selected?: boolean
}>()

const emit = defineEmits<{ remove: [id: string] }>()

const path = computed(() => getBezierPath(props))
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    class="wf-edge"
    :class="{ 'wf-edge--selected': selected }"
    :style="{ stroke: data.color }"
    :interaction-width="20"
  />
  <EdgeLabelRenderer>
    <div
      class="wf-edge__label nodrag nopan"
      :class="{ 'wf-edge__label--selected': selected }"
      :style="{ transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)` }"
    >
      <span v-if="data.label" class="wf-edge__text" :style="{ color: data.color }">{{ data.label }}</span>
      <button type="button" class="wf-edge__remove" title="Remove connection" @click.stop="emit('remove', id)">
        <SlbIcon name="action_trash" :size="12" />
      </button>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.wf-edge {
  stroke-width: 2;
}

.wf-edge--selected {
  stroke-width: 3;
}

.wf-edge__label {
  position: absolute;
  display: flex;
  gap: 4px;
  align-items: center;
  pointer-events: all;

  &:hover .wf-edge__remove,
  &--selected .wf-edge__remove {
    opacity: 1;
  }
}

.wf-edge__text {
  padding: 0 6px;
  font-size: var(--slb-font-xs);
  background: var(--slb-color-surface, #fff);
  border-radius: var(--slb-radius-full);
}

.wf-edge__remove {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--slb-color-text-muted);
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-full);
  opacity: 0;
  cursor: pointer;

  &:hover {
    color: var(--slb-color-error);
  }
}
</style>
