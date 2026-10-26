<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbSelect, SlbTab, type SelectOption, type TabItem } from '@sociallabs/frontend-components'
import { schemaOf } from '@/core/execution/schema'
import ItemTable from './ItemTable.vue'
import SchemaTree from './SchemaTree.vue'
import type { RunSource } from './runSources'

/**
 * Items of the last run for one side of the node view: the input (what upstream nodes sent) or the
 * output (what the node emitted). Large outputs are shown partially; the full data stays on the server.
 */
const props = defineProps<{
  title: string
  sources: readonly RunSource[]
  /** Shown when there is nothing to display. */
  emptyText: string
  running?: boolean
  error?: string | null
}>()

enum View {
  SCHEMA = 'schema',
  TABLE = 'table',
  JSON = 'json',
}

const SHOWN_ITEMS = 100

const VIEWS: TabItem[] = [
  { key: View.SCHEMA, label: 'Schema' },
  { key: View.TABLE, label: 'Table' },
  { key: View.JSON, label: 'JSON' },
]

const view = ref<string>(View.SCHEMA)
const sourceKey = ref<string | null>(null)
const portIndex = ref(0)

watch(
  () => props.sources.map((s) => s.key).join('|'),
  () => {
    if (!props.sources.some((s) => s.key === sourceKey.value)) sourceKey.value = props.sources[0]?.key ?? null
  },
  { immediate: true },
)

const source = computed(() => props.sources.find((s) => s.key === sourceKey.value) ?? props.sources[0])
watch(source, () => (portIndex.value = 0))

const port = computed(() => source.value?.ports[portIndex.value] ?? source.value?.ports[0])
const items = computed(() => port.value?.items ?? [])
const schema = computed(() => (view.value === View.SCHEMA ? schemaOf(items.value.map((i) => i.json)) : []))
const json = computed(() => (view.value === View.JSON ? JSON.stringify(items.value.slice(0, SHOWN_ITEMS).map((i) => i.json), null, 2) : ''))

const sourceOptions = computed<SelectOption[]>(() => props.sources.map((s) => ({ value: s.key, label: s.label })))
const portTabs = computed<TabItem[]>(() =>
  (source.value?.ports ?? []).map((p, i) => ({ key: String(i), label: p.label || `Output ${i + 1}`, badge: p.items.length })),
)
</script>

<template>
  <section class="wf-run-panel">
    <header class="wf-run-panel__header">
      <span class="wf-run-panel__title">{{ title }}</span>
      <span v-if="port" class="wf-run-panel__count">{{ items.length }} {{ items.length === 1 ? 'item' : 'items' }}</span>
      <SlbTab v-if="port" v-model="view" :tabs="VIEWS" variant="segmented" class="wf-run-panel__views" />
    </header>

    <SlbSelect
      v-if="sources.length > 1"
      size="sm"
      :model-value="source?.key ?? null"
      :options="sourceOptions"
      @update:model-value="sourceKey = $event == null ? null : String($event)"
    />
    <SlbTab v-if="portTabs.length > 1" :model-value="String(portIndex)" :tabs="portTabs" variant="pill" @update:model-value="portIndex = Number($event)" />

    <div class="wf-run-panel__body">
      <p v-if="running" class="wf-run-panel__empty">Running…</p>
      <p v-else-if="error" class="wf-run-panel__error">{{ error }}</p>
      <p v-else-if="!port" class="wf-run-panel__empty">{{ emptyText }}</p>
      <p v-else-if="!items.length" class="wf-run-panel__empty">No items</p>
      <template v-else>
        <p v-if="source?.mapping && view !== View.JSON" class="wf-run-panel__hint">Drag a field into a parameter to use it</p>
        <SchemaTree v-if="view === View.SCHEMA" :fields="schema" :mapping="source?.mapping" />
        <ItemTable v-else-if="view === View.TABLE" :items="items" :mapping="source?.mapping" :limit="SHOWN_ITEMS" />
        <pre v-else class="wf-run-panel__json">{{ json }}</pre>
        <p v-if="items.length > SHOWN_ITEMS && view !== View.SCHEMA" class="wf-run-panel__hint">
          Showing {{ SHOWN_ITEMS }} of {{ items.length }} items
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.wf-run-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-width: 0;
  padding: 12px;
  background: var(--slb-color-gray-50);
}

.wf-run-panel__header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.wf-run-panel__title {
  font-size: var(--slb-font-xs);
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wf-run-panel__count {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-run-panel__views {
  margin-left: auto;
}

.wf-run-panel__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.wf-run-panel__empty,
.wf-run-panel__hint {
  margin: 0 0 8px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-run-panel__empty {
  margin-top: 24px;
  text-align: center;
}

.wf-run-panel__error {
  margin: 0;
  padding: 8px 10px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-error);
  background: var(--slb-color-error-light, #fef2f2);
  border-radius: var(--slb-radius-md);
}

.wf-run-panel__json {
  margin: 0;
  font-family: var(--slb-font-mono, monospace);
  font-size: var(--slb-font-xs);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
