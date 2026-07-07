<script setup lang="ts">
/**
 * HttpRequestPanel.vue
 * Рендериться через <component :is> у NodeEditorCenterPanel.
 */
import { reactive, ref, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { defaultHttpRequestParams, type HttpRequestParams } from './index'
import HttpRequestTab from './components/HTTPRequestTab.vue'
import HttpAuthTab from './components/HTTPAuthTab.vue'
import HttpBodyTab from './components/HTTPBodyTab.vue'
import HttpOptionsTab from './components/HTTPOptionsTab.vue'
import HTTPHeadersTab from './components/HTTPHeadersTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('request')

const TABS: TabItem[] = [
  { key: 'request', label: 'Request', icon: 'fas fa-paper-plane' },
  { key: 'auth',    label: 'Auth',    icon: 'fas fa-lock'        },
  { key: 'headers', label: 'Headers', icon: 'fas fa-list'        },
  { key: 'body',    label: 'Body',    icon: 'fas fa-file-code'   },
  { key: 'options', label: 'Options', icon: 'fas fa-cog'         },
]

const params = reactive<HttpRequestParams>({
  ...defaultHttpRequestParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

function patchParams(patch: Partial<HttpRequestParams>) {
  Object.assign(params, patch)
  push()
}

watch(
  () => props.node.parameters,
  (p) => { if (p) Object.assign(params, p) },
  { deep: true }
)
</script>

<template>
  <SlbTab v-model="activeTab" :tabs="TABS" variant="line">

    <template #request>
      <HttpRequestTab :params="params" @update:params="patchParams" />
    </template>

    <template #auth>
      <HttpAuthTab :params="params" @update:params="patchParams" />
    </template>

    <template #headers>
      <HTTPHeadersTab :params="params" @update:params="patchParams" />
    </template>

    <template #body>
      <HttpBodyTab :params="params" @update:params="patchParams" />
    </template>

    <template #options>
      <HttpOptionsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
