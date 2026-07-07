<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultViberClientTriggerParams, type ViberClientTriggerParams } from './index'
import ClientTriggerEventsTab from './components/ViberClientTriggerEventsTab.vue'
import ClientTriggerFiltersTab from './components/ViberClientTriggerFiltersTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('events')

const TABS: TabItem[] = [
  { key: 'events',  label: 'Events',  icon: 'fas fa-bolt'   },
  { key: 'filters', label: 'Filters', icon: 'fas fa-filter' },
]

const params = reactive<ViberClientTriggerParams>({
  ...defaultViberClientTriggerParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<ViberClientTriggerParams>) {
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
