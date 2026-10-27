<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbButton, SlbDropdown, SlbIcon, SlbTooltip, type MenuItem } from '@sociallabs/frontend-components'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { WorkflowDto } from '@/core/workflow/dto'
import {
  formatUpdated,
  isWorkflowCardAction,
  PUBLISH_STATE,
  publishStateOf,
  triggersOf,
  WorkflowCardAction,
  workflowLook,
} from '../presentation'

/** One workflow on the Workflows page: what starts it, its size and state, and a menu of actions. */
const props = defineProps<{
  workflow: WorkflowDto
  nodeTypes: readonly NodeTypeDescriptor[]
  /** Being activated or deactivated. */
  switching?: boolean
}>()

const emit = defineEmits<{ action: [action: WorkflowCardAction] }>()

const triggers = computed(() => triggersOf(props.workflow, props.nodeTypes))
const look = computed(() => workflowLook(triggers.value))
const publish = computed(() => PUBLISH_STATE[publishStateOf(props.workflow)])

const menu = computed<MenuItem[]>(() => [
  { key: WorkflowCardAction.OPEN, label: 'Open', icon: 'action_edit' },
  { key: WorkflowCardAction.EXECUTE, label: 'Execute', icon: 'media_play' },
  { key: WorkflowCardAction.EXECUTIONS, label: 'Executions', icon: 'action_history' },
  props.workflow.active
    ? { key: WorkflowCardAction.TOGGLE_ACTIVE, label: 'Deactivate', icon: 'media_pause', disabled: props.switching }
    : { key: WorkflowCardAction.TOGGLE_ACTIVE, label: 'Activate', icon: 'action_bolt', disabled: props.switching },
  { key: 'divider', type: 'divider' },
  { key: WorkflowCardAction.DELETE, label: 'Delete', icon: 'action_trash', danger: true, disabled: props.workflow.active },
])

const onMenu = (item: MenuItem): void => {
  if (isWorkflowCardAction(item.key)) emit('action', item.key)
}
</script>

<template>
  <article
    class="wf-card"
    tabindex="0"
    :aria-label="`Open workflow ${workflow.name}`"
    @click="emit('action', WorkflowCardAction.OPEN)"
    @keydown.enter.self="emit('action', WorkflowCardAction.OPEN)"
  >
    <header class="wf-card__head">
      <span class="wf-card__icon" :style="{ '--wf-card-tone': look.color }">
        <SlbIcon :name="look.icon" :size="20" />
      </span>
      <div class="wf-card__title">
        <h3 class="wf-card__name">{{ workflow.name }}</h3>
        <span class="wf-card__meta">#{{ workflow.id }}</span>
      </div>
      <SlbBadge :color="workflow.active ? 'success' : 'gray'" dot>{{ workflow.active ? 'Active' : 'Inactive' }}</SlbBadge>
      <SlbDropdown :items="menu" placement="bottom-end" @select="onMenu" @click.stop>
        <SlbButton variant="ghost" size="sm" icon-only icon-left="menu_dots_h" :aria-label="`${workflow.name} actions`" />
      </SlbDropdown>
    </header>

    <p class="wf-card__desc">{{ workflow.description || 'No description yet.' }}</p>

    <dl class="wf-card__stats">
      <div>
        <dt>Nodes</dt>
        <dd>{{ workflow.nodes.length }}</dd>
      </div>
      <div>
        <dt>Connections</dt>
        <dd>{{ workflow.connections.length }}</dd>
      </div>
      <div>
        <dt>Version</dt>
        <dd><SlbBadge size="sm" :color="publish.color">{{ publish.label }}</SlbBadge></dd>
      </div>
    </dl>

    <footer class="wf-card__foot">
      <div class="wf-card__triggers">
        <SlbTooltip v-for="trigger in triggers" :key="trigger.nodeId" :content="trigger.name" :arrow="false">
          <span class="wf-card__trigger" :style="{ background: trigger.presentation.color }">
            <SlbIcon :name="trigger.presentation.icon" :size="12" color="#fff" />
          </span>
        </SlbTooltip>
        <span v-if="!triggers.length" class="wf-card__muted">No trigger</span>
      </div>
      <span class="wf-card__muted">
        <SlbIcon name="object_clock" :size="12" /> Updated {{ formatUpdated(workflow.updatedAt).toLowerCase() }}
      </span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.wf-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--slb-color-white);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-lg);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: var(--slb-color-gray-300);
    box-shadow: var(--slb-shadow-sm);
  }

  &:focus-visible {
    outline: 2px solid var(--slb-color-primary);
    outline-offset: 2px;
  }
}

.wf-card__head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.wf-card__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--wf-card-tone);
  background: color-mix(in srgb, var(--wf-card-tone) 12%, var(--slb-color-white));
  border-radius: var(--slb-radius-md);
}

.wf-card__title {
  flex: 1;
  min-width: 0;
}

.wf-card__name {
  margin: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: var(--slb-color-gray-900);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-card__meta {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11px;
  color: var(--slb-color-gray-500);
}

.wf-card__desc {
  display: -webkit-box;
  min-height: 2.8em;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.4;
  color: var(--slb-color-gray-600);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.wf-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  background: var(--slb-color-gray-50);
  border-radius: var(--slb-radius-md);

  dt {
    font-size: 11px;
    color: var(--slb-color-gray-500);
  }

  dd {
    margin: 2px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--slb-color-gray-900);
  }
}

.wf-card__foot {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.wf-card__triggers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.wf-card__trigger {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

.wf-card__muted {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: var(--slb-color-gray-500);
}
</style>
