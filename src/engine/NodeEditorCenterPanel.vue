<script setup lang="ts">
import type { Component } from 'vue'
import { onMounted, ref, shallowRef, watch } from 'vue'
import { SlbButton } from '@/components/ui'
import type { NodeInstance } from '@/stores/node/types'
import { resolveNodePanel } from './node-panel-registry'

const props = defineProps<{ node: NodeInstance }>()

const emit = defineEmits<{
  'update:node': [NodeInstance]
  save:          [NodeInstance]
  close:         []
}>()

const localNode      = ref<NodeInstance>(JSON.parse(JSON.stringify(props.node)))
const panelComponent = shallowRef<Component | null>(null)
const loading        = ref(true)

onMounted(async () => {
  loading.value        = true
  panelComponent.value = await resolveNodePanel(props.node.discriminator)
  loading.value        = false
})

watch(
  () => props.node,
  (n) => { localNode.value = JSON.parse(JSON.stringify(n)) },
  { deep: true }
)

function onNodeUpdate(updated: NodeInstance) {
  localNode.value = updated
  emit('update:node', updated)
}

function updateName(val: string | number) {
  localNode.value = { ...localNode.value, name: String(val) }
  emit('update:node', localNode.value)
}
</script>

<template>
  <div class="slb-ned__center">
    <!-- Loading -->
    <div v-if="loading" class="slb-ned__loading">
      <i class="fas fa-spinner fa-spin"></i>
      Loading...
    </div>

    <!-- Dynamic panel — resolved from registry, no v-if chains -->
    <div v-else class="slb-ned__params-scroll">
      <component
        :is="panelComponent"
        :node="localNode"
        @update:node="onNodeUpdate"
      />
    </div>

    <!-- Footer -->
    <div class="slb-ned__footer">
      <SlbButton variant="primary" size="sm" @click="emit('save', localNode)">
        <i class="fas fa-check"></i>
        Save Changes
      </SlbButton>
      <SlbButton variant="secondary" size="sm" @click="$emit('close')">
        Cancel
      </SlbButton>
    </div>

  </div>
</template>

<style lang="scss">
@use './node-editor.scss';
</style>
