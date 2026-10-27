<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { SlbIcon } from '@sociallabs/frontend-components'
import { PortRole, type PortView } from '@/core/node-types/ports'
import { inputHandle, outputHandle } from '../canvasModel'

/**
 * Main handles along one side of a node card, evenly spaced. Inputs are pills; an output that leads nowhere yet
 * shows a stub with its label and a plus to drag a connection from, hidden while that connection is drawn.
 */
const props = defineProps<{
  nodeId: string
  ports: readonly PortView[]
  side: 'input' | 'output'
  /** Read-only canvas: no stubs, nothing to drag from. */
  readonly?: boolean
}>()

const emit = defineEmits<{
  /** The plus of an unconnected port was clicked: add a node there. */
  plus: [handleId: string]
}>()

const { edges, connectionStartHandle } = useVueFlow()

const connected = computed(() => {
  const ids = new Set<string>()
  for (const edge of edges.value) {
    if (props.side === 'output' && edge.source === props.nodeId && edge.sourceHandle) ids.add(edge.sourceHandle)
    if (props.side === 'input' && edge.target === props.nodeId && edge.targetHandle) ids.add(edge.targetHandle)
  }
  return ids
})

const dragged = computed(() => (connectionStartHandle.value?.nodeId === props.nodeId ? connectionStartHandle.value.id : null))

const handleId = (port: PortView): string => (props.side === 'input' ? inputHandle(port.index) : outputHandle(port.index))
const top = (i: number): string => `${((i + 1) / (props.ports.length + 1)) * 100}%`
const showStub = (port: PortView): boolean =>
  !props.readonly && !connected.value.has(handleId(port)) && dragged.value !== handleId(port)
</script>

<template>
  <Handle
    v-for="(port, i) in ports"
    :id="handleId(port)"
    :key="port.index"
    :type="side === 'input' ? 'target' : 'source'"
    :position="side === 'input' ? Position.Left : Position.Right"
    :class="[
      side === 'input' ? 'wf-port wf-port--input' : 'wf-port wf-port--output',
      {
        'wf-port--error': port.role === PortRole.ERROR,
        'wf-port--fallback': port.role === PortRole.FALLBACK,
      },
    ]"
    :style="{ top: top(i) }"
  >
    <span v-if="side === 'input' && port.label" class="wf-port__input-label">{{ port.label }}</span>
    <template v-if="side === 'output'">
      <Transition name="wf-port-stub">
        <span v-if="showStub(port)" class="wf-port__stub nodrag">
          <span class="wf-port__line" />
          <span v-if="port.label" class="wf-port__label">{{ port.label }}</span>
          <span class="wf-port__plus" title="Click to add a node, or drag to connect" @click.stop="emit('plus', handleId(port))">
            <SlbIcon name="action_plus" :size="12" />
          </span>
        </span>
      </Transition>
      <span v-if="!showStub(port) && port.label && ports.length > 1" class="wf-port__label wf-port__label--connected">
        {{ port.label }}
      </span>
    </template>
  </Handle>
</template>

<style scoped lang="scss">
.wf-port {
  --wf-port-color: var(--slb-color-gray-400);

  &--error {
    --wf-port-color: var(--slb-color-error);
  }
}

// Replaces Vue Flow's default handle look; its position and transform stay.
.wf-port--input {
  width: 6px;
  min-width: 0;
  height: 22px;
  background: var(--wf-port-color);
  border: 0;
  border-radius: 3px;
  transition: background var(--slb-duration) var(--slb-ease);

  // Vue Flow marks the input under a connection being drawn.
  &:hover,
  &.connecting,
  &.valid {
    background: var(--slb-color-primary);
  }
}

.wf-port--output {
  width: 12px;
  min-width: 0;
  height: 12px;
  background: var(--slb-color-white);
  border: 2px solid var(--wf-port-color);
  border-radius: 50%;
  cursor: crosshair;
  transition: border-color var(--slb-duration) var(--slb-ease);

  &:hover {
    border-color: var(--slb-color-primary);
  }
}

.wf-port--fallback {
  border-style: dashed;
}

.wf-port__input-label {
  position: absolute;
  top: 50%;
  right: calc(100% + 6px);
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--slb-color-text-muted);
  white-space: nowrap;
  pointer-events: none;
}

.wf-port__stub {
  position: absolute;
  top: 50%;
  left: 100%;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
  cursor: crosshair;
}

.wf-port__line {
  width: 46px;
  height: 2px;
  background: var(--slb-color-gray-300);
}

.wf-port__label {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 6px;
  max-width: 60px;
  overflow: hidden;
  font-size: 10px;
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;

  .wf-port--error & {
    color: var(--slb-color-error);
  }

  &--connected {
    bottom: 100%;
    left: calc(100% + 4px);
  }
}

.wf-port__plus {
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
    color: var(--slb-color-primary);
    border-color: var(--slb-color-primary);
    transform: scale(1.1);
    box-shadow: var(--slb-shadow-md);
  }
}

.wf-port-stub-enter-active,
.wf-port-stub-leave-active {
  transition: opacity 0.12s ease;
}

.wf-port-stub-enter-from,
.wf-port-stub-leave-to {
  opacity: 0;
}
</style>
