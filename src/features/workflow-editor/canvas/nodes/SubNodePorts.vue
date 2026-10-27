<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { PortView } from '@/core/node-types/ports'
import { inputHandle, outputHandle } from '../canvasModel'

/**
 * Sub-node handles: an agent's model, memory and tool inputs along its bottom edge, a sub-node's output on
 * its top edge, so attached sub-nodes sit below the node that uses them. An input with nothing attached yet
 * shows a stub down to a plus to drag a sub-node connection from, hidden while that connection is drawn.
 */
const props = defineProps<{
  nodeId: string
  ports: readonly PortView[]
  side: 'input' | 'output'
  /** Read-only canvas: no stubs, nothing to drag from. */
  readonly?: boolean
}>()

const emit = defineEmits<{
  /** The plus of an empty sub-node input was clicked: add a sub-node there. */
  plus: [handleId: string]
}>()

const { edges, connectionStartHandle } = useVueFlow()

const attached = computed(() => {
  const ids = new Set<string>()
  for (const edge of edges.value) {
    if (edge.target === props.nodeId && edge.targetHandle) ids.add(edge.targetHandle)
  }
  return ids
})

const dragged = computed(() => (connectionStartHandle.value?.nodeId === props.nodeId ? connectionStartHandle.value.id : null))

const handleId = (port: PortView): string => (props.side === 'input' ? inputHandle(port.index) : outputHandle(port.index))
const left = (i: number): string => `${((i + 1) / (props.ports.length + 1)) * 100}%`
const showStub = (port: PortView): boolean =>
  !props.readonly && props.side === 'input' && !attached.value.has(handleId(port)) && dragged.value !== handleId(port)
</script>

<template>
  <Handle
    v-for="(port, i) in ports"
    :id="handleId(port)"
    :key="port.index"
    :type="side === 'input' ? 'target' : 'source'"
    :position="side === 'input' ? Position.Bottom : Position.Top"
    class="wf-subport"
    :data-kind="port.kind"
    :style="{ left: left(i) }"
  >
    <template v-if="side === 'input'">
      <span v-if="port.label" class="wf-subport__label">{{ port.label }}</span>
      <Transition name="wf-subport-stub">
        <span v-if="showStub(port)" class="wf-subport__stub nodrag" :title="`Click to add ${port.label || 'a sub-node'}, or drag to attach one`">
          <span class="wf-subport__line" />
          <span class="wf-subport__plus" @click.stop="emit('plus', handleId(port))">
            <SlbIcon name="action_plus" :size="12" />
          </span>
        </span>
      </Transition>
    </template>
  </Handle>
</template>

<style scoped lang="scss">
// The handle box stays upright so its stub hangs straight down; the diamond is drawn inside it.
.wf-subport {
  --wf-subport-color: #7c3aed;

  width: 12px;
  min-width: 0;
  height: 12px;
  background: transparent;
  border: 0;
  border-radius: 0;
  cursor: crosshair;

  &::before {
    position: absolute;
    inset: 1px;
    content: '';
    background: var(--slb-color-white);
    border: 2px solid var(--wf-subport-color);
    border-radius: 2px;
    transform: rotate(45deg);
    transition: background var(--slb-duration) var(--slb-ease);
  }

  &:hover::before,
  &.connecting::before,
  &.valid::before {
    background: var(--wf-subport-color);
  }

  &[data-kind='AI_MODEL'] {
    --wf-subport-color: #2563eb;
  }

  &[data-kind='AI_MEMORY'] {
    --wf-subport-color: #0891b2;
  }
}

.wf-subport__label {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text-muted);
  white-space: nowrap;
  pointer-events: none;
}

.wf-subport__stub {
  position: absolute;
  top: calc(100% + 18px);
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  cursor: crosshair;
}

.wf-subport__line {
  width: 2px;
  height: 22px;
  background: var(--slb-color-gray-300);
}

.wf-subport__plus {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: var(--slb-color-text-muted);
  background: var(--slb-color-white);
  border: 1.5px solid var(--slb-color-gray-300);
  border-radius: 7px;
  transition: transform 0.1s ease, box-shadow 0.1s ease, color 0.1s ease, border-color 0.1s ease;

  &:hover {
    color: var(--wf-subport-color);
    border-color: var(--wf-subport-color);
    transform: scale(1.1);
    box-shadow: var(--slb-shadow-md);
  }
}

.wf-subport-stub-enter-active,
.wf-subport-stub-leave-active {
  transition: opacity 0.12s ease;
}

.wf-subport-stub-enter-from,
.wf-subport-stub-leave-to {
  opacity: 0;
}
</style>
