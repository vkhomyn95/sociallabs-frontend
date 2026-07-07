<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultViberBotActionParams, type ViberBotActionParams } from './index'
import BotActionMessageTab from './components/ViberBotActionMessageTab.vue'
import BotActionKeyboardTab from './components/ViberBotActionKeyboardTab.vue'
import BotActionOptionsTab  from './components/ViberBotActionOptionsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('message')

const TABS: TabItem[] = [
  { key: 'message',  label: 'Message',  icon: 'fas fa-paper-plane' },
  { key: 'keyboard', label: 'Keyboard', icon: 'fas fa-keyboard'    },
  { key: 'options',  label: 'Options',  icon: 'fas fa-cog'         },
]

const params = reactive<ViberBotActionParams>({
  ...defaultViberBotActionParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<ViberBotActionParams>) {
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
      <BotActionMessageTab :params="params" @update:params="patchParams" />
    </template>

    <template #keyboard>
      <BotActionKeyboardTab :params="params" @update:params="patchParams" />
    </template>

    <template #options>
      <BotActionOptionsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
