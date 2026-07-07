<script setup lang="ts">
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{
  'back': []
  'save': []
  'toggle': []
  'execute': []
  'settings': []
  'credentials': []
}>()

const workflowStore = useWorkflowStore()
const {loading, workflow} = storeToRefs(workflowStore);
</script>

<template>
  <header class="slb-wf-toolbar">
    <div class="slb-wf-toolbar__left">
      <SlbButton
        variant="ghost"
        size="sm"
        icon-only
        icon-left="fas fa-arrow-left"
        @click="emit('back')"
      />

      <input
        v-if="workflow"
        class="slb-wf-toolbar__name"
        v-model="workflow!.name"
        placeholder="Workflow name"
        @input="emit('update:name', ($event.target as HTMLInputElement).value)"
        @blur="emit('update:name', ($event.target as HTMLInputElement).value)"
      />

      <span
        class="slb-wf-toolbar__badge"
        :class="workflow?.active ? 'slb-wf-toolbar__badge--active' : 'slb-wf-toolbar__badge--inactive'"
      >
        <i :class="workflow?.active ? 'fa-solid fa-circle' : 'fa-regular fa-circle'"></i>
        {{ workflow?.active ? 'Active' : 'Inactive' }}
      </span>
    </div>

    <div class="slb-wf-toolbar__right">
      <SlbButton
        variant="secondary"
        size="sm"
        icon-left="fa-regular fa-floppy-disk"
        :loading="loading"
        :disabled="loading"
        @click="emit('save')"
      >
        Save
      </SlbButton>

      <SlbButton
        variant="secondary"
        size="sm"
        :icon-left="workflow?.active ? 'fa-regular fa-circle-pause' : 'fa-regular fa-circle-play'"
        @click="emit('toggle')"
      >
        {{ workflow?.active ? 'Deactivate' : 'Activate' }}
      </SlbButton>

      <SlbButton
        variant="success"
        size="sm"
        icon-left="fas fa-bolt"
        @click="emit('execute')"
      >
        Execute
      </SlbButton>

      <SlbButton
        variant="ghost"
        size="sm"
        icon-only
        icon-left="fas fa-gear"
        @click="emit('settings')"
      />

      <SlbButton
        variant="secondary"
        size="sm"
        icon-left="fas fa-key"
        @click="emit('credentials')"
      >
        Credentials
      </SlbButton>
    </div>
  </header>
</template>

<style lang="scss">
@use './workflow-toolbar.scss';
</style>
