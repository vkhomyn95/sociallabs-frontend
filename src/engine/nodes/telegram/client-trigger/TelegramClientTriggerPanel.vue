<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultTelegramClientTriggerParams, type TelegramClientTriggerParams } from './index'
import ClientTriggerEventsTab from './components/TelegramClientTriggerEventsTab.vue'
import ClientTriggerFiltersTab from './components/TelegramClientTriggerFiltersTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('events')

const TABS: TabItem[] = [
  { key: 'events',  label: 'Events',  icon: 'fas fa-bolt'   },
  { key: 'filters', label: 'Filters', icon: 'fas fa-filter' },
]

const params = reactive<TelegramClientTriggerParams>({
  ...defaultTelegramClientTriggerParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<TelegramClientTriggerParams>) {
  Object.assign(params, patch)
  push()
}

watch(
  () => props.node.parameters,
  (p) => { if (p) Object.assign(params, p) },
  { deep: true },
)
</script>

<template>
  <SlbTab v-model="activeTab" :tabs="TABS" variant="line">

    <template #events>
      <ClientTriggerEventsTab :params="params" @update:params="patchParams" />
    </template>

    <template #filters>
      <ClientTriggerFiltersTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
