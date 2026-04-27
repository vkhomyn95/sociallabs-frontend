<template>
  <div class="slb-node-type-selector">
    <div class="slb-node-type-selector__options">
      <button
        v-for="option in NODE_TYPE_OPTIONS"
        :key="option.value"
        class="slb-node-type-selector__card"
        :style="{ '--card-accent': option.color }"
        @click="$emit('select', option.value)"
      >
        <span class="slb-node-type-selector__card-icon">
          <i :class="option.icon"></i>
        </span>
        <span class="slb-node-type-selector__card-body">
          <span class="slb-node-type-selector__card-label">{{ option.label }}</span>
          <span class="slb-node-type-selector__card-desc">{{ option.description }}</span>
        </span>
        <i class="fas fa-chevron-right slb-node-type-selector__card-arrow"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeTypeOption } from './types'
import { NodeType } from '@/stores/node/types.ts'

defineEmits<{
  select: [type: NodeType]
}>()

const NODE_TYPE_OPTIONS: NodeTypeOption[] = [
  {
    value: NodeType.TRIGGER,
    label: 'Trigger',
    description: 'Starts the workflow when an event occurs',
    icon: 'fas fa-bolt',
    color: '#f59e0b',
  },
  {
    value: NodeType.ACTION,
    label: 'Action',
    description: 'Performs a task or transforms data',
    icon: 'fas fa-play-circle',
    color: '#6366f1',
  },
]
</script>
