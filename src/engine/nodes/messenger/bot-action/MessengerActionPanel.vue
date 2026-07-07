<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultMessengerActionParams, type MessengerActionParams } from './index'
import ActionMessageTab from './components/MessengerActionMessageTab.vue'
import ActionOptionsTab from './components/MessengerActionOptionsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('message')

const TABS: TabItem[] = [
  { key: 'message', label: 'Parameters', icon: 'fas fa-paper-plane' },
  { key: 'options', label: 'Options',    icon: 'fas fa-cog'         },
]

const params = reactive<MessengerActionParams>({
  ...defaultMessengerActionParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<MessengerActionParams>) {
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
    <template #message>
      <ActionMessageTab :params="params" @update:params="patchParams" />
    </template>
    <template #options>
      <ActionOptionsTab :params="params" @update:params="patchParams" />
    </template>
  </SlbTab>
</template>
