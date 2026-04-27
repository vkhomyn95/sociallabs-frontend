<script setup lang="ts">
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{
  'create': []
}>()

const workflowStore = useWorkflowStore()
const {loading, workflow} = storeToRefs(workflowStore);
</script>

<template>
  <header class="slb-wf-toolbar">
    <div class="slb-wf-toolbar__left">
      <h1 class="slb-wf-list__title">Workflows</h1>
    </div>

    <div class="slb-wf-toolbar__right">
      <SlbButton
        variant="primary"
        icon-left="fas fa-box-open"
        size="sm"
        @click="emit('create')"
      >
        Create workflow
      </SlbButton>
    </div>
  </header>
</template>

<style lang="scss">
@use './workflow-toolbar.scss';
</style>
