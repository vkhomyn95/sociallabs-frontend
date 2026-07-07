<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { WhatsAppActionParams } from '../index'

const props = defineProps<{ params: WhatsAppActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WhatsAppActionParams>] }>()

function set<K extends keyof WhatsAppActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-wa-section">

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
