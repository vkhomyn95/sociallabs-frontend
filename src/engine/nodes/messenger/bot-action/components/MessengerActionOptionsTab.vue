<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { MessengerActionParams } from '../index'

const props = defineProps<{ params: MessengerActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<MessengerActionParams>] }>()

function set<K extends keyof MessengerActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-ms-section">
    <div class="slb-ms-group-label">Advanced</div>
    <div class="slb-ms-options">
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
