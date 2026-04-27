<template>
  <nav class="slb-node-panel__breadcrumb" aria-label="Navigation">
    <button
      class="slb-node-panel__breadcrumb-item"
      @click="$emit('navigate', PanelStep.TYPE)"
    >
      Nodes
    </button>

    <span class="slb-node-panel__breadcrumb-sep">
      <i class="fas fa-chevron-right"></i>
    </span>

    <button
      v-if="selectedType"
      class="slb-node-panel__breadcrumb-item"
      :class="{ 'is-active': step === PanelStep.CATEGORY }"
      @click="$emit('navigate', PanelStep.CATEGORY)"
    >
      {{ typeLabel }}
    </button>

    <template v-if="selectedCategory && step === PanelStep.NODES">
      <span class="slb-node-panel__breadcrumb-sep">
        <i class="fas fa-chevron-right"></i>
      </span>
      <span class="slb-node-panel__breadcrumb-item is-active">
        {{ formatCategory(selectedCategory) }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PanelStep } from './types'
import { NodeType } from '@/stores/node/types.ts'

const props = defineProps<{
  step: PanelStep
  selectedType: NodeType | null
  selectedCategory: string | null
}>()

defineEmits<{
  navigate: [step: PanelStep]
}>()

const typeLabel = computed(() =>
  props.selectedType === NodeType.TRIGGER ? 'Triggers' : 'Actions'
)

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
</script>
