<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, type GraphNode, type Position } from '@vue-flow/core'
import { SlbIcon } from '@sociallabs/frontend-components'
import { floorOf, type CanvasEdgeData } from '../canvasModel'
import { edgePath, EdgeShape } from './edgePath'

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  sourceNode: GraphNode
  targetNode: GraphNode
  data: CanvasEdgeData
  selected?: boolean
  /** Read-only canvas: connections cannot be removed. */
  readonly?: boolean
}>()

const emit = defineEmits<{ remove: [id: string] }>()

// Sub-node attachments always curve straight up from the sub-node; data edges detour when they run back.
const path = computed(() =>
  edgePath(props, {
    shape: props.data.subNode ? EdgeShape.BEZIER : EdgeShape.AUTO,
    floorY: Math.max(floorOf(props.sourceNode), floorOf(props.targetNode)),
  }),
)
</script>

<template>
  <BaseEdge
    v-for="(segment, index) in path.segments"
    :id="`${id}-${index}`"
    :key="index"
    :path="segment.path"
    class="wf-edge"
    :class="{ 'wf-edge--selected': selected, 'wf-edge--sub-node': data.subNode, 'wf-edge--broken': data.broken }"
    :style="{ stroke: data.color }"
    :interaction-width="20"
  />
  <EdgeLabelRenderer>
    <div
      class="wf-edge__label nodrag nopan"
      :class="{ 'wf-edge__label--selected': selected || data.broken }"
      :title="data.broken ? 'This connection joins ports the nodes do not have; remove it' : undefined"
      :style="{ transform: `translate(-50%, -50%) translate(${path.labelX}px, ${path.labelY}px)` }"
    >
      <span v-if="data.label" class="wf-edge__text" :style="{ color: data.color }">{{ data.label }}</span>
      <button v-if="!readonly" type="button" class="wf-edge__remove" title="Remove connection" @click.stop="emit('remove', id)">
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

.wf-edge--sub-node,
.wf-edge--broken {
  stroke-dasharray: 6 4;
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
