<script setup lang="ts">
import { ref, computed } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import NodeEditorSchemaNode from './NodeEditorSchemaNode.vue'

type ViewMode = 'schema' | 'table' | 'json'

const props = defineProps<{
  data:      Record<string, any>[] | null
  error:     string | null
  isTesting: boolean
}>()

const viewMode   = ref<ViewMode>('schema')
const selectedItem = ref(0)

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'schema', label: 'Schema' },
  { key: 'table',  label: 'Table'  },
  { key: 'json',   label: 'JSON'   },
]

function getColumns(data: Record<string, any>[]): string[] {
  const keys = new Set<string>()
  data.forEach(item => Object.keys(item).forEach(k => keys.add(k)))
  return [...keys]
}

const itemCount = computed(() => props.data?.length ?? 0)
</script>

<template>
  <div class="slb-ned__side slb-ned__side--right">
    <!-- Header -->
    <div class="slb-ned__side-header">
      <span class="slb-ned__side-title">Output</span>
      <div class="slb-ned__side-controls">
        <span v-if="data" class="slb-ned__item-badge">
          {{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}
        </span>
        <div v-if="data" class="slb-ned__view-toggle">
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

    <!-- Item tabs -->
    <div v-if="data && data.length > 1" class="slb-ned__item-tabs">
      <button
        v-for="(_, idx) in data"
        :key="idx"
        class="slb-ned__item-tab"
        :class="{ active: selectedItem === idx }"
        @click="selectedItem = idx"
      >
        {{ idx + 1 }}
      </button>
    </div>

    <!-- Content -->
    <div class="slb-ned__side-scroll">

      <!-- Testing -->
      <div v-if="isTesting" class="slb-ned__empty">
        <i class="fas fa-spinner fa-spin"></i>
        <p class="slb-ned__empty-title">Running node...</p>
      </div>

      <!-- No output -->
      <div v-else-if="!data && !error" class="slb-ned__empty">
        <i class="fas fa-play-circle"></i>
        <p class="slb-ned__empty-title">No output yet</p>
        <p class="slb-ned__empty-hint">
          Click <strong>Execute step</strong><br/>to run this node
        </p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="slb-ned__error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Schema view -->
      <div v-else-if="viewMode === 'schema' && data" class="slb-ned__schema-tree">
        <NodeEditorSchemaNode
          v-for="(value, key) in data[selectedItem]"
          :key="key"
          :label="String(key)"
          :value="value"
          :path="String(key)"
          :depth="0"
          :is-output="true"
        />
      </div>

      <!-- Table view -->
      <div v-else-if="viewMode === 'table' && data" class="slb-ned__table-wrap">
        <table class="slb-ned__table">
          <thead>
          <tr>
            <th v-for="col in getColumns(data)" :key="col">{{ col }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, idx) in data" :key="idx">
            <td v-for="col in getColumns(data)" :key="col">
              {{ row[col] !== undefined ? JSON.stringify(row[col]) : '—' }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- JSON view -->
      <div v-else-if="viewMode === 'json' && data" class="slb-ned__json-wrap">
        <pre class="slb-ned__json-pre">{{ JSON.stringify(data[selectedItem], null, 2) }}</pre>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
@use './node-editor.scss';
</style>
