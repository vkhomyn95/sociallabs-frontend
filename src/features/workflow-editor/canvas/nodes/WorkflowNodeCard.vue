<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { SlbIconName } from '@sociallabs/frontend-components'
import { NodeRunState } from '@/core/execution/ExecutionTracker'
import { NodeTypeStatus } from '@/core/node-types/descriptor'
import { isSubNodePort } from '@/core/node-types/ports'
import { subtitleOf } from '@/core/node-types/subtitle'
import { NODE_SIZE, type CanvasNodeData } from '../canvasModel'
import NodePorts from './NodePorts.vue'
import SubNodePorts from './SubNodePorts.vue'

/**
 * Draws any node from its descriptor: an icon card with the ports, and the name and what the node does below it;
 * an agent has its name inside, since the stubs of its sub-node inputs hang below. There are no per-type card
 * components.
 */
const props = defineProps<{
  id: string
  data: CanvasNodeData
  selected?: boolean
  /** Shown, not edited: no node actions and no stubs to drag connections from. */
  readonly?: boolean
}>()

const emit = defineEmits<{
  open: [id: string]
  remove: [id: string]
  toggleDisabled: [id: string]
  /** The plus of a port was clicked. */
  plus: [id: string, handleId: string]
}>()

const PORT_ROW = 28
const SUPPLY_SIZE = 80
const SUB_PORT_WIDTH = 80

const mainInputs = computed(() => props.data.inputs.filter((p) => !isSubNodePort(p)))
const subInputs = computed(() => props.data.inputs.filter(isSubNodePort))
const mainOutputs = computed(() => props.data.outputs.filter((p) => !isSubNodePort(p)))
const subOutputs = computed(() => props.data.outputs.filter(isSubNodePort))
const agent = computed(() => subInputs.value.length > 0)

const size = computed(() => {
  if (props.data.supply) return { width: SUPPLY_SIZE, height: SUPPLY_SIZE }
  const ports = Math.max(mainOutputs.value.length, mainInputs.value.length)
  return {
    width: agent.value ? Math.max(2 * NODE_SIZE, subInputs.value.length * SUB_PORT_WIDTH) : NODE_SIZE,
    height: Math.max(NODE_SIZE, (ports + 1) * PORT_ROW),
  }
})

const subtitle = computed(() => {
  const text = subtitleOf(props.data.descriptor, props.data.node)
  return text === props.data.node.name ? '' : text
})
const preview = computed(() => props.data.descriptor?.status === NodeTypeStatus.PREVIEW)

const RUN_ICONS: Record<NodeRunState, SlbIconName> = {
  [NodeRunState.RUNNING]: 'shape_spinner',
  [NodeRunState.SUCCESS]: 'status_success',
  [NodeRunState.ERROR]: 'status_error',
  [NodeRunState.SKIPPED]: 'action_minus',
}

const runLabel = computed(() => {
  const run = props.data.run
  if (!run) return ''
  if (run.state === NodeRunState.ERROR) return run.error ?? 'Failed'
  if (run.state === NodeRunState.RUNNING) return 'Running'
  if (run.state === NodeRunState.SKIPPED) return 'Skipped'
  return `${run.itemsOut} ${run.itemsOut === 1 ? 'item' : 'items'}`
})
</script>

<template>
  <div
    class="wf-node"
    :class="{
      'wf-node--selected': selected,
      'wf-node--disabled': data.node.disabled,
      'wf-node--trigger': data.trigger,
      'wf-node--supply': data.supply,
      'wf-node--agent': agent,
      'wf-node--unknown': !data.descriptor,
      [`wf-node--run-${data.run?.state.toLowerCase()}`]: data.run,
    }"
    :style="{ width: `${size.width}px`, height: `${size.height}px`, '--wf-node-accent': data.presentation.color }"
    @dblclick.stop="emit('open', id)"
  >
    <NodePorts :node-id="id" :ports="mainInputs" side="input" :readonly="readonly" @plus="emit('plus', id, $event)" />
    <SubNodePorts :node-id="id" :ports="subInputs" side="input" :readonly="readonly" @plus="emit('plus', id, $event)" />
    <SubNodePorts :node-id="id" :ports="subOutputs" side="output" :readonly="readonly" />

    <div class="wf-node__icon">
      <SlbIcon :name="data.presentation.icon" :size="data.supply ? 22 : 28" color="#fff" />
    </div>

    <span v-if="preview" class="wf-node__flag" title="Not runnable yet">preview</span>
    <span v-if="data.run" class="wf-node__run" :title="runLabel">
      <SlbIcon :name="RUN_ICONS[data.run.state]" :size="12" />
      <span v-if="data.run.state === NodeRunState.SUCCESS">{{ runLabel }}</span>
    </span>

    <div v-if="!readonly" class="wf-node__actions nodrag">
      <button type="button" title="Open" @click.stop="emit('open', id)">
        <SlbIcon name="action_edit" :size="14" />
      </button>
      <button type="button" :title="data.node.disabled ? 'Enable' : 'Disable'" @click.stop="emit('toggleDisabled', id)">
        <SlbIcon :name="data.node.disabled ? 'visibility_on' : 'visibility_off'" :size="14" />
      </button>
      <button type="button" title="Delete" class="wf-node__danger" @click.stop="emit('remove', id)">
        <SlbIcon name="action_trash" :size="14" />
      </button>
    </div>

    <NodePorts :node-id="id" :ports="mainOutputs" side="output" :readonly="readonly" @plus="emit('plus', id, $event)" />

    <div class="wf-node__meta">
      <span class="wf-node__name" :title="data.node.name">{{ data.node.name }}</span>
      <span v-if="subtitle" class="wf-node__subtitle" :title="subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wf-node {
  position: relative;
  display: grid;
  place-items: center;
  background: var(--slb-color-surface, #fff);
  border: 1.5px solid var(--slb-color-border);
  border-radius: 18px;
  box-shadow: var(--slb-shadow-sm);
  transition: border-color var(--slb-duration) var(--slb-ease), box-shadow var(--slb-duration) var(--slb-ease);

  &:hover {
    border-color: var(--slb-color-gray-300);
    box-shadow: var(--slb-shadow-md);

    .wf-node__actions {
      opacity: 1;
    }
  }

  &--selected,
  &--selected:hover {
    border-color: var(--slb-color-primary);
    box-shadow: 0 0 0 3px var(--slb-color-primary-ring);
  }

  // Triggers start the flow; their rounded left side has no input.
  &--trigger {
    border-top-left-radius: 50px;
    border-bottom-left-radius: 50px;
  }

  &--supply {
    border-radius: 50%;
  }

  &--agent {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
    padding: 0 16px;
  }

  &--disabled {
    opacity: 0.55;

    .wf-node__name {
      text-decoration: line-through;
    }
  }

  &--unknown {
    border-style: dashed;
  }

  &--run-running {
    border-color: var(--slb-color-primary);
    animation: wf-node-pulse 1.5s ease-in-out infinite;
  }

  &--run-success {
    border-color: var(--slb-color-success);
  }

  &--run-error {
    border-color: var(--slb-color-error);
  }
}

.wf-node__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--wf-node-accent);

  .wf-node--agent & {
    flex: none;
  }

  .wf-node--supply & {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
}

// Name and subtitle hang below the card, outside the box Vue Flow measures, so handles stay centred on the card.
// An agent keeps them inside, beside the icon.
.wf-node__meta {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 180px;
  transform: translateX(-50%);
  text-align: center;

  .wf-node--agent & {
    position: static;
    align-items: flex-start;
    width: auto;
    min-width: 0;
    transform: none;
    text-align: left;
  }
}

.wf-node__name,
.wf-node__subtitle {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-node__name {
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-text);
}

.wf-node__subtitle {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-node__run {
  position: absolute;
  right: -6px;
  bottom: -10px;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 6px;
  font-size: 10px;
  color: var(--slb-color-text-muted);
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-full);

  .wf-node--run-success & {
    color: var(--slb-color-success);
  }

  .wf-node--run-error & {
    color: var(--slb-color-error);
  }

  .wf-node--run-running & :deep(svg) {
    animation: wf-node-spin 1s linear infinite;
  }
}

.wf-node__flag {
  position: absolute;
  top: -9px;
  right: 6px;
  padding: 0 6px;
  font-size: 10px;
  color: var(--slb-color-warning);
  background: var(--slb-color-warning-light);
  border-radius: var(--slb-radius-full);
}

.wf-node__actions {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
  box-shadow: var(--slb-shadow-sm);
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity var(--slb-duration) var(--slb-ease);

  button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    color: var(--slb-color-text-muted);
    background: none;
    border: 0;
    border-radius: var(--slb-radius-sm);
    cursor: pointer;

    &:hover {
      color: var(--slb-color-text);
      background: var(--slb-color-gray-100);
    }
  }

  .wf-node__danger:hover {
    color: var(--slb-color-error);
  }
}

@keyframes wf-node-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes wf-node-pulse {
  50% {
    box-shadow: 0 0 0 6px var(--slb-color-primary-ring);
  }
}
</style>
