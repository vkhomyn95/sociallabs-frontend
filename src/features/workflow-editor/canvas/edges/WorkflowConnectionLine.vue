<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, Position, type ConnectionLineProps } from '@vue-flow/core'
import { floorOf } from '../canvasModel'
import { edgePath, EdgeShape } from './edgePath'

/**
 * The line drawn while a connection is dragged, shaped like the edge it becomes: dragged back from an output it
 * already takes the detour below the source. Drags from an input or a sub-node port stay a plain curve.
 */
const props = defineProps<ConnectionLineProps>()

const fromMainOutput = computed(() => props.sourceHandle?.type === 'source' && props.sourceHandle.position === Position.Right)
const path = computed(() =>
  edgePath(props, {
    shape: fromMainOutput.value ? EdgeShape.AUTO : EdgeShape.BEZIER,
    floorY: floorOf(props.sourceNode),
  }),
)
</script>

<template>
  <BaseEdge v-for="(segment, index) in path.segments" :key="index" :path="segment.path" class="wf-connection-line" />
</template>

<style scoped lang="scss">
.wf-connection-line {
  fill: none;
  stroke: var(--slb-color-gray-400);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
