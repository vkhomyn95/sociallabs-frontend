<template>
  <div class="slb-node-panel">
    <!-- Header -->
    <div class="slb-node-panel__header">

      <!-- Breadcrumb (прихований під час пошуку) -->
      <NodePanelBreadcrumb
        :step="currentStep"
        :selected-type="selectedType"
        :selected-category="selectedCategory"
        @navigate="navigateTo"
      />

      <!-- Search (завжди видимий) -->
      <NodePanelSearch v-model="searchQuery" />
    </div>

    <!-- Content -->
    <div class="slb-node-panel__content">
      <!-- Loading -->
      <NodePanelLoader v-if="loading" />

      <!-- Error -->
      <NodePanelError v-else-if="error" :message="error" @retry="retry" />

      <!-- Глобальний пошук — перекриває wizard -->
      <NodeList
        v-else-if="searchQuery"
        :nodes="searchResults"
        :search-query="searchQuery"
        @dragstart="onDragStart"
      />

      <!-- Step: Type selection -->
      <NodeTypeSelector
        v-else-if="currentStep === PanelStep.TYPE"
        @select="selectType"
      />

      <!-- Step: Category selection -->
      <NodeCategorySelector
        v-else-if="currentStep === PanelStep.CATEGORY"
        :type="selectedType!"
        :categories="filteredCategories"
        @select="selectCategory"
      />

      <!-- Step: Nodes list -->
      <NodeList
        v-else-if="currentStep === PanelStep.NODES"
        :nodes="displayedNodes"
        :search-query="searchQuery"
        @dragstart="onDragStart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNodeStore } from '@/stores/node'
import { NodeType } from '@/stores/node/types'

import NodePanelBreadcrumb from './NodePanelBreadcrumb.vue'
import NodePanelSearch from './NodePanelSearch.vue'
import NodePanelLoader from './NodePanelLoader.vue'
import NodePanelError from './NodePanelError.vue'
import NodeTypeSelector from './NodeTypeSelector.vue'
import NodeCategorySelector from './NodeCategorySelector.vue'
import NodeList from './NodeList.vue'

import { useNodePanel } from './useNodePanel'
import { PanelStep } from './types'
import SlbButton from '../../ui/button/SlbButton.vue'

// ─── Store ────────────────────────────────────────────────────────────────────
const nodeStore = useNodeStore()
const { loading, error } = storeToRefs(nodeStore)

// ─── Composable ───────────────────────────────────────────────────────────────
const {
  currentStep,
  selectedType,
  selectedCategory,
  searchQuery,
  canGoBack,
  goBack,
  navigateTo,
  selectType,
  selectCategory,
} = useNodePanel()

// ─── Computed ─────────────────────────────────────────────────────────────────
const title = computed(() => {
  if (searchQuery.value) return 'Search Results'
  switch (currentStep.value) {
    case PanelStep.TYPE:     return 'Select kind of node'
    case PanelStep.CATEGORY: return 'Select category'
    case PanelStep.NODES:    return 'Select node'
    default: return 'Nodes'
  }
})

// Глобальний пошук по всіх нодах
const searchResults = computed(() =>
  nodeStore.searchNodes(searchQuery.value)
)

// Категорії відфільтровані за обраним типом
const filteredCategories = computed(() => {
  if (!selectedType.value) return []

  return nodeStore.categories.filter(category => {
    const nodes = nodeStore.getNodesByCategory(category)
    return nodes.some(node => {
      if (selectedType.value === NodeType.TRIGGER) return node.type === NodeType.TRIGGER
      return node.type !== NodeType.TRIGGER
    })
  })
})

// Ноди в категорії, відфільтровані за типом
const displayedNodes = computed(() => {
  if (!selectedCategory.value) return []

  const allNodes = nodeStore.getNodesByCategory(selectedCategory.value)
  if (!selectedType.value) return allNodes

  return allNodes.filter(node => {
    if (selectedType.value === NodeType.TRIGGER) return node.type === NodeType.TRIGGER
    return node.type !== NodeType.TRIGGER
  })
})

// ─── Methods ──────────────────────────────────────────────────────────────────
function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

function onDragStart(event: DragEvent, node: any) {
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('application/node', JSON.stringify(node))
}

async function retry() {
  await nodeStore.FETCH_AVAILABLE_NODES()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!nodeStore.isLoaded) {
    await nodeStore.FETCH_AVAILABLE_NODES()
  }
})
</script>

<style lang="scss">
@use './node-panel.scss';
</style>
