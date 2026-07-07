<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { WhatsAppTriggerParams } from '../index'

const props = defineProps<{ params: WhatsAppTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WhatsAppTriggerParams>] }>()

function set<K extends keyof WhatsAppTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-wa-section">

    <div class="slb-wa-warn">
      <i class="fas fa-exclamation-triangle"></i>
      WhatsApp only allows <strong>one webhook per Facebook App</strong>.
      Switching between test and production URLs overwrites the registered webhook.
      Disable the workflow when testing to avoid conflicts.
    </div>

    <div class="slb-wa-group-label">Advanced</div>

    <div class="slb-wa-options">
      <SlbCheckbox
        :model-value="params.continueOnFail"
        label="Continue on Fail"
        description="Continue workflow execution even if this node fails"
        @update:model-value="set('continueOnFail', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
