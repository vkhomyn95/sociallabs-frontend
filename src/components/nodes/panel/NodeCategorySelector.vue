<template>
  <div class="slb-node-category-selector">
    <div class="slb-node-category-selector__list">
      <button
        v-for="category in categories"
        :key="category"
        class="slb-node-category-selector__item"
        :style="{ '--cat-color': getCategoryColor(category) }"
        @click="$emit('select', category)"
      >
        <span class="slb-node-category-selector__item-icon">
          <i :class="getCategoryIcon(category)"></i>
        </span>
        <span class="slb-node-category-selector__item-label">
          {{ formatCategory(category) }}
        </span>
        <i class="fa-solid fa-chevron-right slb-node-category-selector__item-arrow"></i>
      </button>
    </div>

    <div v-if="categories.length === 0" class="slb-node-panel__state slb-node-panel__state--empty">
      <i class="fa-solid fa-inbox"></i>
      <p>No categories available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NodeCategory, NodeType } from '@/stores/node/types'
import { getCategoryDisplay } from '@/stores/node/constants'

defineProps<{
  type: NodeType
  categories: string[]
}>()

defineEmits<{
  select: [category: string]
}>()

function getCategoryIcon(category: string): string {
  const display = getCategoryDisplay(category as NodeCategory)
  return display?.icon ?? 'fas fa-folder'
}

function getCategoryColor(category: string): string {
  const display = getCategoryDisplay(category as NodeCategory)
  return display?.color ?? '#6b7280'
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
</script>
