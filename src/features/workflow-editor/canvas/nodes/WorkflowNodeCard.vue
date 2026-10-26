<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { SlbIconName } from '@sociallabs/frontend-components'
import { NodeRunState } from '@/core/execution/ExecutionTracker'
import { NodeTypeStatus } from '@/core/node-types/descriptor'
import type { CanvasNodeData } from '../canvasModel'
import NodePorts from './NodePorts.vue'

/** Draws any node from its descriptor: icon, name, ports and state; there are no per-type card components. */
const props = defineProps<{
  id: string
  data: CanvasNodeData
  selected?: boolean
}>()

const emit = defineEmits<{
  open: [id: string]
  remove: [id: string]
  toggleDisabled: [id: string]
}>()

const PORT_ROW = 26
const MIN_HEIGHT = 64

const height = computed(() => Math.max(MIN_HEIGHT, (Math.max(props.data.outputs.length, props.data.inputs.length) + 1) * PORT_ROW))
const subtitle = computed(() => props.data.descriptor?.displayName ?? `${props.data.node.type} (unknown type)`)
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
      'wf-node--unknown': !data.descriptor,
      [`wf-node--run-${data.run?.state.toLowerCase()}`]: data.run,
    }"
    :style="{ height: `${height}px`, '--wf-node-accent': data.presentation.color }"
    @dblclick.stop="emit('open', id)"
  >
    <NodePorts :ports="data.inputs" side="input" />

    <div class="wf-node__icon">
      <SlbIcon :name="data.presentation.icon" :size="20" color="#fff" />
    </div>
    <div class="wf-node__text">
      <span class="wf-node__name" :title="data.node.name">{{ data.node.name }}</span>
      <span class="wf-node__type">{{ subtitle }}</span>
    </div>
    <span v-if="preview" class="wf-node__flag" title="Not runnable yet">preview</span>
    <span v-if="data.run" class="wf-node__run" :title="runLabel">
      <SlbIcon :name="RUN_ICONS[data.run.state]" :size="12" />
      <span v-if="data.run.state === NodeRunState.SUCCESS">{{ runLabel }}</span>
    </span>

    <div class="wf-node__actions nodrag">
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

    <NodePorts :ports="data.outputs" side="output" />
  </div>
</template>

<style scoped lang="scss">
.wf-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
  padding: 0 12px;
  background: var(--slb-color-surface, #fff);
  border: 1.5px solid var(--slb-color-border);
  border-radius: var(--slb-radius-lg);
  box-shadow: var(--slb-shadow-sm);
  transition: border-color var(--slb-duration) var(--slb-ease), box-shadow var(--slb-duration) var(--slb-ease);

  &:hover {
    box-shadow: var(--slb-shadow-md);

    .wf-node__actions {
      opacity: 1;
    }
  }

  &--selected {
    border-color: var(--slb-color-primary);
    box-shadow: 0 0 0 3px var(--slb-color-primary-ring);
  }

  &--trigger {
    border-top-left-radius: 28px;
    border-bottom-left-radius: 28px;
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
  }

  &--run-success {
    border-color: var(--slb-color-success);
  }

  &--run-error {
    border-color: var(--slb-color-error);
  }
}

.wf-node__run {
  position: absolute;
  right: 8px;
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

@keyframes wf-node-spin {
  to {
    transform: rotate(360deg);
  }
}

.wf-node__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--slb-radius-md);
  background: var(--wf-node-accent);
}

.wf-node__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wf-node__name {
  overflow: hidden;
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-node__type {
  overflow: hidden;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-node__flag {
  position: absolute;
  top: -9px;
  right: 10px;
  padding: 0 6px;
  font-size: 10px;
  color: var(--slb-color-warning);
  background: var(--slb-color-warning-light);
  border-radius: var(--slb-radius-full);
}

.wf-node__actions {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
  opacity: 0;
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
</style>
