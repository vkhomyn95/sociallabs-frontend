<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { PortRole, type PortView } from '@/core/node-types/ports'
import { inputHandle, outputHandle } from '../canvasModel'

/** Connection handles along one side of a node card, evenly spaced, with output labels. */
const props = defineProps<{
  ports: readonly PortView[]
  side: 'input' | 'output'
}>()

const top = (i: number): string => `${((i + 1) / (props.ports.length + 1)) * 100}%`
</script>

<template>
  <template v-for="(port, i) in ports" :key="port.index">
    <Handle
      :id="side === 'input' ? inputHandle(port.index) : outputHandle(port.index)"
      :type="side === 'input' ? 'target' : 'source'"
      :position="side === 'input' ? Position.Left : Position.Right"
      class="wf-port"
      :class="{
        'wf-port--error': port.role === PortRole.ERROR,
        'wf-port--fallback': port.role === PortRole.FALLBACK,
      }"
      :style="{ top: top(i) }"
    />
    <span
      v-if="side === 'output' && port.label"
      class="wf-port__label"
      :style="{ top: top(i) }"
    >{{ port.label }}</span>
  </template>
</template>

<style scoped lang="scss">
.wf-port {
  width: 10px;
  height: 10px;
  background: var(--slb-color-white);
  border: 2px solid var(--slb-color-gray-400);

  &:hover {
    border-color: var(--slb-color-primary);
  }

  &--error {
    border-color: var(--slb-color-error);
  }

  &--fallback {
    border-style: dashed;
  }
}

.wf-port__label {
  position: absolute;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  white-space: nowrap;
  pointer-events: none;
}
</style>
