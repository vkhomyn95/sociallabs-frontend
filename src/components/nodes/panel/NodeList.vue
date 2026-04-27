<template>
  <div class="slb-node-list">
    <!-- Empty state -->
    <div v-if="nodes.length === 0" class="slb-node-panel__state slb-node-panel__state--empty">
      <i class="fas fa-search"></i>
      <p>{{ searchQuery ? 'No nodes found' : 'No nodes available' }}</p>
    </div>

    <!-- Node items -->
    <div v-else class="slb-node-list__items">
      <div
        v-for="node in nodes"
        :key="node.discriminator"
        class="slb-node-list__item"
        :style="{ '--node-color': NodeColors[node.discriminator] }"
        draggable="true"
        @dragstart="$emit('dragstart', $event, node)"
      >
        <span class="slb-node-list__item-icon">
          <i :class="NodeIcons[node.discriminator]"></i>
        </span>
        <span class="slb-node-list__item-body">
          <span class="slb-node-list__item-name">{{ node.name }}</span>
          <span class="slb-node-list__item-desc">{{ node.description }}</span>
        </span>
        <span class="slb-node-list__item-drag">
          <i class="fas fa-grip-vertical"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrichedNodeMetadata } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants.ts'

defineProps<{
  nodes: EnrichedNodeMetadata[]
  searchQuery?: string
}>()

defineEmits<{
  dragstart: [event: DragEvent, node: EnrichedNodeMetadata]
}>()
</script>
