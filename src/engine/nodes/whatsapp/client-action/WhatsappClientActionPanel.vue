<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultWAClientActionParams, type WAClientActionParams } from './index'
import ClientActionMessageTab from './components/WhatsappClientActionMessageTab.vue'
import ClientActionOptionsTab from './components/WhatsappClientActionOptionsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('message')

const TABS: TabItem[] = [
  { key: 'message', label: 'Parameters', icon: 'fas fa-paper-plane' },
  { key: 'options', label: 'Options',    icon: 'fas fa-cog'         },
]

const params = reactive<WAClientActionParams>({
  ...defaultWAClientActionParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<WAClientActionParams>) {
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
      <ClientActionMessageTab :params="params" @update:params="patchParams" />
    </template>

    <template #options>
      <ClientActionOptionsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
