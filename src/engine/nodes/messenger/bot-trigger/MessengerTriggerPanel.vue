<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultMessengerTriggerParams, type MessengerTriggerParams } from './index'
import TriggerEventsTab  from './components/MessengerTriggerEventsTab.vue'
import TriggerOptionsTab from './components/MessengerTriggerOptionsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('events')

const TABS: TabItem[] = [
  { key: 'events',  label: 'Events',  icon: 'fas fa-bolt' },
  { key: 'options', label: 'Options', icon: 'fas fa-cog'  },
]

const params = reactive<MessengerTriggerParams>({
  ...defaultMessengerTriggerParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<MessengerTriggerParams>) {
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
      <TriggerEventsTab :params="params" @update:params="patchParams" />
    </template>
    <template #options>
      <TriggerOptionsTab :params="params" @update:params="patchParams" />
    </template>
  </SlbTab>
</template>
