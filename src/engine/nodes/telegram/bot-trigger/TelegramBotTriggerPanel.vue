<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultTelegramBotTriggerParams, type TelegramBotTriggerParams } from './index'
import BotTriggerEventsTab from './components/TelegramBotTriggerEventsTab.vue'
import BotTriggerDownloadsTab from './components/TelegramBotTriggerDownloadsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('events')

const TABS: TabItem[] = [
  { key: 'events',    label: 'Events',    icon: 'fas fa-bolt'          },
  { key: 'downloads', label: 'Downloads', icon: 'fas fa-cloud-download-alt' },
]

const params = reactive<TelegramBotTriggerParams>({
  ...defaultTelegramBotTriggerParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<TelegramBotTriggerParams>) {
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

    <template #downloads>
      <BotTriggerDownloadsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
