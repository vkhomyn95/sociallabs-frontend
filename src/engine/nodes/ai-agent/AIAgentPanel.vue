<script setup lang="ts">
/**
 * AiAgentPanel.vue
 * Рендериться через <component :is> у NodeEditorCenterPanel.
 */
import { reactive, watch, ref } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import { type AiAgentParams, defaultAiAgentParams } from './index'
import AiAgentPromptTab     from './AiAgentPromptTab.vue'
import AiAgentGuardrailsTab from './AiAgentGuardrailsTab.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('prompt')

const TABS: TabItem[] = [
  { key: 'prompt',     label: 'Prompt',     icon: 'fas fa-comment-dots' },
  { key: 'guardrails', label: 'Guardrails', icon: 'fas fa-shield-alt'   },
]

const params = reactive<AiAgentParams>({
  ...defaultAiAgentParams(),
  ...(props.node.parameters ?? {}),
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

// Partial patch from child tabs
function patchParams(patch: Partial<AiAgentParams>) {
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

    <template #prompt>
      <AiAgentPromptTab :params="params" @update:params="patchParams" />
    </template>

    <template #guardrails>
      <AiAgentGuardrailsTab :params="params" @update:params="patchParams" />
    </template>

  </SlbTab>
</template>
