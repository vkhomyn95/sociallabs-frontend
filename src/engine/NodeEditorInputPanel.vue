<script setup lang="ts">
import { ref, computed } from 'vue'
import NodeEditorSchemaNode from './NodeEditorSchemaNode.vue'
import type { NodeInstance } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'

export interface InputNode {
  node:      NodeInstance
  data:      Record<string, any>[] | null  // null = not yet executed
  hasData:   boolean
}

type ViewMode = 'schema' | 'table' | 'json'

const props = defineProps<{
  inputNodes: InputNode[]
}>()

const emit = defineEmits<{
  'execute-previous': []
  'drag-field': [{ path: string; value: any }]
}>()

const viewMode      = ref<ViewMode>('schema')
const expandedNodes = ref<Set<string>>(new Set())
const selectedItem  = ref(0)

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'schema', label: 'Schema' },
  { key: 'table',  label: 'Table'  },
  { key: 'json',   label: 'JSON'   },
]

function toggleNode(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value = new Set([...expandedNodes.value, nodeId])
  }
}

// Table columns: union of all keys from all items
function getColumns(data: Record<string, any>[]): string[] {
  const keys = new Set<string>()
  data.forEach(item => Object.keys(item).forEach(k => keys.add(k)))
  return [...keys]
}

function nodeColor(node: NodeInstance): string {
  return NodeColors[node.discriminator as keyof typeof NodeColors] ?? '#6b7280'
}
function nodeIcon(node: NodeInstance): string {
  return NodeIcons[node.discriminator as keyof typeof NodeIcons] ?? 'fas fa-cube'
}
</script>

<template>
  <div class="slb-ned__side">
    <!-- Header -->
    <div class="slb-ned__side-header">
      <span class="slb-ned__side-title">Input</span>
      <div class="slb-ned__side-controls">
        <div class="slb-ned__view-toggle">
          <button
            v-for="mode in VIEW_MODES"
            :key="mode.key"
            class="slb-ned__view-btn"
            :class="{ 'slb-ned__view-btn--active': viewMode === mode.key }"
            @click="viewMode = mode.key"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!inputNodes.length" class="slb-ned__side-scroll">
      <div class="slb-ned__empty">
        <i class="fas fa-sign-in-alt"></i>
        <p class="slb-ned__empty-title">No input data</p>
        <p class="slb-ned__empty-hint">Run previous nodes to see their output here</p>
      </div>
    </div>

    <!-- Node list -->
    <div v-else class="slb-ned__node-list">
      <div
        v-for="entry in inputNodes"
        :key="entry.node.nodeId"
        class="slb-ned__node-item"
      >
        <!-- Node row header -->
        <div
          class="slb-ned__node-row"
          @click="toggleNode(entry.node.nodeId)"
        >
          <span
            class="slb-ned__node-expand"
            :class="{
              'slb-ned__node-expand--open':   expandedNodes.has(entry.node.nodeId),
              'slb-ned__node-expand--hidden': !entry.hasData,
            }"
          >
           <i class="fa-solid fa-chevron-right"></i>
          </span>

          <span class="slb-ned__node-icon" :style="{ background: nodeColor(entry.node) }">
            <i :class="nodeIcon(entry.node)"></i>
          </span>

          <span class="slb-ned__node-name">{{ entry.node.name }}</span>

          <span v-if="!entry.hasData" class="slb-ned__node-preview">Preview</span>
        </div>

        <!-- Expanded: no data yet → execute prompt -->
        <div
          v-if="expandedNodes.has(entry.node.nodeId) && !entry.hasData"
          class="slb-ned__node-data"
        >
          <div class="slb-ned__execute-prev">
            <p style="font-size:11px;color:#6b7280;margin:0 0 6px">
              The fields below come from the last successful execution.
            </p>
            <button class="slb-ned__exec-btn" @click.stop="$emit('execute-previous')">
              <i class="fas fa-play"></i>
              Execute previous nodes
            </button>
            <span class="slb-ned__exec-hint">to view input data</span>
          </div>
        </div>

        <!-- Expanded: has data -->
        <div
          v-else-if="expandedNodes.has(entry.node.nodeId) && entry.data"
          class="slb-ned__node-data"
        >
          <!-- Item tabs if multiple items -->
          <div v-if="entry.data.length > 1" class="slb-ned__item-tabs">
            <button
              v-for="(_, idx) in entry.data"
              :key="idx"
              class="slb-ned__item-tab"
              :class="{ active: selectedItem === idx }"
              @click.stop="selectedItem = idx"
            >
              {{ idx + 1 }}
            </button>
          </div>

          <!-- Schema view -->
          <div v-if="viewMode === 'schema'" class="slb-ned__schema-tree">
            <NodeEditorSchemaNode
              v-for="(value, key) in entry.data[selectedItem]"
              :key="key"
              :label="String(key)"
              :value="value"
              :path="String(key)"
              :depth="0"
              :is-output="false"
              @drag-field="$emit('drag-field', $event)"
            />
          </div>

          <!-- Table view -->
          <div v-else-if="viewMode === 'table'" class="slb-ned__table-wrap">
            <table class="slb-ned__table">
              <thead>
              <tr>
                <th v-for="col in getColumns(entry.data)" :key="col">{{ col }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, idx) in entry.data" :key="idx">
                <td v-for="col in getColumns(entry.data)" :key="col">
                  {{ row[col] !== undefined ? JSON.stringify(row[col]) : '—' }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- JSON view -->
          <div v-else-if="viewMode === 'json'" class="slb-ned__json-wrap">
            <pre class="slb-ned__json-pre">{{ JSON.stringify(entry.data[selectedItem], null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use './node-editor.scss';
</style>
