<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultViberBotTriggerParams, type ViberBotTriggerParams } from './index'
import BotTriggerEventsTab   from './components/ViberBotTriggerEventsTab.vue'
import BotTriggerSettingsTab from './components/ViberBotTriggerSettingsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('events')

const TABS: TabItem[] = [
  { key: 'events',   label: 'Events',   icon: 'fas fa-bolt'        },
  { key: 'settings', label: 'Settings', icon: 'fas fa-sliders-h'   },
]

const params = reactive<ViberBotTriggerParams>({
  ...defaultViberBotTriggerParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<ViberBotTriggerParams>) {
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
      <BotTriggerEventsTab :params="params" @update:params="patchParams" />
    </template>

    <template #settings>
      <BotTriggerSettingsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
