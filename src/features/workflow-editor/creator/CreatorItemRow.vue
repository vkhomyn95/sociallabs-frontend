<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import { CreatorItemKind, type CreatorItem } from './creatorModel'
import { isPreview, lookOf, opensView } from './creatorPresentation'
import { writeNodeDrag } from './dragPayload'

/** One row of the node creator: a node or action to add, or an app or category to open. */
const props = defineProps<{
  item: CreatorItem
  active: boolean
}>()

const emit = defineEmits<{ choose: []; hover: [] }>()

const look = computed(() => lookOf(props.item))

function onDragStart(event: DragEvent): void {
  const item = props.item
  if (item.kind === CreatorItemKind.NODE) writeNodeDrag(event, { key: item.type.key, parameters: item.parameters })
}
</script>

<template>
  <button
    type="button"
    role="option"
    class="wf-creator-row"
    :class="{ 'wf-creator-row--active': active }"
    :aria-selected="active"
    :draggable="item.kind === CreatorItemKind.NODE"
    @click="emit('choose')"
    @mousemove="emit('hover')"
    @dragstart="onDragStart"
  >
    <span class="wf-creator-row__icon" :style="{ '--wf-creator-tone': look.color }">
      <SlbIcon :name="look.icon" :size="16" />
    </span>
    <span class="wf-creator-row__text">
      <span class="wf-creator-row__title">
        {{ item.title }}
        <span v-if="isPreview(item)" class="wf-creator-row__flag">preview</span>
      </span>
      <span v-if="item.description" class="wf-creator-row__description">{{ item.description }}</span>
    </span>
    <SlbIcon v-if="opensView(item)" name="arrow_right" :size="14" class="wf-creator-row__chevron" />
  </button>
</template>

<style scoped lang="scss">
.wf-creator-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  background: none;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &--active {
    background: var(--slb-color-gray-50);
    border-left-color: var(--slb-color-primary);
  }

  &[draggable='true'] {
    cursor: grab;
  }
}

.wf-creator-row__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--wf-creator-tone);
  background: color-mix(in srgb, var(--wf-creator-tone) 12%, var(--slb-color-white));
  border-radius: var(--slb-radius-md);
}

.wf-creator-row__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.wf-creator-row__title {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-gray-900);
}

.wf-creator-row__description {
  overflow: hidden;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-gray-500);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-creator-row__flag {
  padding: 0 6px;
  font-size: 10px;
  font-weight: var(--slb-fw-regular, 400);
  color: var(--slb-color-warning);
  background: var(--slb-color-warning-light);
  border-radius: var(--slb-radius-full);
}

.wf-creator-row__chevron {
  flex-shrink: 0;
  color: var(--slb-color-gray-400);
}
</style>
