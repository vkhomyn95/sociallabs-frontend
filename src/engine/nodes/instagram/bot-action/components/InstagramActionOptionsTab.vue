<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { InstagramActionParams } from '../index'

const props = defineProps<{ params: InstagramActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<InstagramActionParams>] }>()

function set<K extends keyof InstagramActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-ig-section">
    <div class="slb-ig-group-label">Advanced</div>
    <div class="slb-ig-options">
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
