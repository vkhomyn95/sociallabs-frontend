<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbIcon, SlbInput } from '@sociallabs/frontend-components'
import { NodeGroup, NodeTypeStatus, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { presentationOf } from '../presentation'
import { NODE_TYPE_DRAG_FORMAT } from './dragFormat'

/** Node types to drag onto the canvas, or click to add in the middle of the view. */
const props = defineProps<{ catalog: NodeTypeCatalog }>()
const emit = defineEmits<{ add: [type: NodeTypeDescriptor] }>()

const GROUP_LABELS: Record<NodeGroup, string> = {
  [NodeGroup.CORE]: 'Core',
  [NodeGroup.COMMUNICATION]: 'Communication',
  [NodeGroup.LOGIC]: 'Logic',
  [NodeGroup.DATA]: 'Data',
  [NodeGroup.AI]: 'AI',
}

const query = ref('')
const groups = computed(() => props.catalog.grouped(query.value))

function onDragStart(event: DragEvent, type: NodeTypeDescriptor): void {
  event.dataTransfer?.setData(NODE_TYPE_DRAG_FORMAT, type.key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <aside class="wf-palette">
    <SlbInput v-model="query" size="sm" placeholder="Search nodes" icon-left="action_search" clearable />
    <div class="wf-palette__groups">
      <section v-for="entry in groups" :key="entry.group" class="wf-palette__group">
        <h3 class="wf-palette__title">{{ GROUP_LABELS[entry.group] }}</h3>
        <button
          v-for="type in entry.types"
          :key="type.key"
          type="button"
          class="wf-palette__item"
          draggable="true"
          :title="type.description || type.displayName"
          @dragstart="onDragStart($event, type)"
          @click="emit('add', type)"
        >
          <span class="wf-palette__icon" :style="{ background: presentationOf(type.name, type).color }">
            <SlbIcon :name="presentationOf(type.name, type).icon" :size="16" color="#fff" />
          </span>
          <span class="wf-palette__name">{{ type.displayName }}</span>
          <span v-if="type.status === NodeTypeStatus.PREVIEW" class="wf-palette__flag">preview</span>
        </button>
      </section>
      <p v-if="!groups.length" class="wf-palette__empty">No nodes match “{{ query }}”</p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.wf-palette {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 260px;
  padding: 12px;
  overflow: hidden;
  background: var(--slb-color-surface, #fff);
  border-right: 1px solid var(--slb-color-border);
}

.wf-palette__groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.wf-palette__title {
  margin: 0 0 4px;
  font-size: var(--slb-font-xs);
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wf-palette__item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  font: inherit;
  color: var(--slb-color-text);
  text-align: left;
  background: none;
  border: 0;
  border-radius: var(--slb-radius-md);
  cursor: grab;

  &:hover {
    background: var(--slb-color-gray-100);
  }
}

.wf-palette__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--slb-radius-sm);
}

.wf-palette__name {
  flex: 1;
  font-size: var(--slb-font-sm);
}

.wf-palette__flag {
  font-size: 10px;
  color: var(--slb-color-warning);
}

.wf-palette__empty {
  font-size: var(--slb-font-sm);
  color: var(--slb-color-text-muted);
}
</style>
