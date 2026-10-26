<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { PortView } from '@/core/node-types/ports'
import { inputHandle, outputHandle } from '../canvasModel'

/**
 * Sub-node handles: an agent's model, memory and tool inputs along its bottom edge, a sub-node's output on
 * its top edge, so attached sub-nodes sit below the node that uses them.
 */
const props = defineProps<{
  ports: readonly PortView[]
  side: 'input' | 'output'
}>()

const left = (i: number): string => `${((i + 1) / (props.ports.length + 1)) * 100}%`
</script>

<template>
  <template v-for="(port, i) in ports" :key="port.index">
    <Handle
      :id="side === 'input' ? inputHandle(port.index) : outputHandle(port.index)"
      :type="side === 'input' ? 'target' : 'source'"
      :position="side === 'input' ? Position.Bottom : Position.Top"
      class="wf-subport"
      :data-kind="port.kind"
      :style="{ left: left(i) }"
    />
    <span v-if="side === 'input' && port.label" class="wf-subport__label" :style="{ left: left(i) }">{{ port.label }}</span>
  </template>
</template>

<style scoped lang="scss">
.wf-subport {
  width: 10px;
  height: 10px;
  background: var(--slb-color-white);
  border: 2px solid #7c3aed;
  border-radius: 2px;
  transform: translate(-50%, 50%) rotate(45deg);

  &[data-kind='AI_MODEL'] {
    border-color: #2563eb;
  }

  &[data-kind='AI_MEMORY'] {
    border-color: #0891b2;
  }
}

.wf-subport__label {
  position: absolute;
  top: calc(100% + 8px);
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--slb-color-text-muted);
  white-space: nowrap;
  pointer-events: none;
}
</style>
