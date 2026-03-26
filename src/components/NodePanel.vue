<template>
  <div class="node-panel">
    <div class="panel-header">
      <h3>Nodes</h3>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search nodes..."
      />
    </div>

    <div class="panel-content">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading nodes...
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="retry" class="btn-retry">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>

      <div v-else-if="searchQuery" class="search-results">
        <h4 class="section-title">Search Results</h4>
        <div v-if="searchResults.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <p>No nodes found</p>
        </div>
        <div v-else class="node-list">
          <div
            v-for="node in searchResults"
            :key="node.discriminator"
            class="node-item"
            :style="{ borderLeftColor: node.color }"
            draggable="true"
            @dragstart="onDragStart($event, node)"
          >
            <i :class="node.icon" class="node-item-icon" :style="{ color: node.color }"></i>
            <div class="node-item-content">
              <div class="node-item-name">{{ node.name }}</div>
              <div class="node-item-desc">{{ node.description }}</div>
              <div class="node-item-category">{{ formatCategory(node.category) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="categories">
        <div
          v-for="category in categories"
          :key="category"
          class="category"
        >
          <h4 class="category-title">
            <i :class="getCategoryIcon(category)" :style="{ color: getCategoryColor(category) }"></i>
            {{ formatCategory(category) }}
          </h4>
          <div class="node-list">
            <div
              v-for="node in getNodesByCategory(category)"
              :key="node.discriminator"
              class="node-item"
              :style="{ borderLeftColor: NodeColors[node.discriminator] }"
              draggable="true"
              @dragstart="onDragStart($event, node)"
            >
              <i :class="NodeIcons[node.discriminator]" class="node-item-icon" :style="{ color: NodeColors[node.discriminator] }"></i>
              <div class="node-item-content">
                <div class="node-item-name">{{ node.name }}</div>
                <div class="node-item-desc">{{ node.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNodeStore } from '@/stores/node'
import { NodeCategory } from '@/stores/node/types'
import { getCategoryDisplay, NodeColors, NodeIcons } from '@/stores/node/constants'

const nodeStore = useNodeStore();
const searchQuery = ref('');
const loading = computed(() => nodeStore.loading);
const error = computed(() => nodeStore.error);

// ========== Computed ==========

const categories = computed(() => nodeStore.categories);

const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  return nodeStore.searchNodes(searchQuery.value);
});

// ========== Methods ==========

function getNodesByCategory(category: string) {
  return nodeStore.getNodesByCategory(category);
}

function getCategoryIcon(category: string): string {
  const categoryEnum = category as NodeCategory;
  const display = getCategoryDisplay(categoryEnum);
  return display ? display.icon : 'fas fa-folder';
}

function getCategoryColor(category: string): string {
  const categoryEnum = category as NodeCategory;
  const display = getCategoryDisplay(categoryEnum);
  return display ? display.color : '#6b7280';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function onDragStart(event: DragEvent, node: any) {
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('application/node', JSON.stringify(node));
}

async function retry() {
  await nodeStore.FETCH_AVAILABLE_NODES();
}

// ========== Lifecycle ==========

onMounted(async () => {
  if (!nodeStore.isLoaded) {
    await nodeStore.FETCH_AVAILABLE_NODES();
  }
});
</script>

<style scoped>
.node-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 10px center;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.loading,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
  padding: 40px 20px;
  text-align: center;
}

.error-state {
  color: #ef4444;
}

.error-state i {
  font-size: 32px;
}

.btn-retry {
  margin-top: 8px;
  padding: 8px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #4f46e5;
}

.search-results,
.categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
  padding: 0 8px;
}

.category {
  margin-bottom: 8px;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0 0 8px 0;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-title i {
  font-size: 14px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.node-item {
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-left: 3px solid #6366f1;
  border-radius: 6px;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.node-item:hover {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-item-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.node-item-content {
  flex: 1;
  min-width: 0;
}

.node-item-name {
  font-weight: 500;
  font-size: 14px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-item-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.node-item-category {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 32px;
  color: #d1d5db;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}
</style>
