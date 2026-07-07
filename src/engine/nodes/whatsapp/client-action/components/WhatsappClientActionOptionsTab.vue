<script setup lang="ts">
import { SlbCheckbox, SlbInput } from '@/components/ui'
import type { WAClientActionParams } from '../index'

const props = defineProps<{ params: WAClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WAClientActionParams>] }>()

function set<K extends keyof WAClientActionParams>(key: K, val: any) {
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

    <SlbInput
      :model-value="params.requestTimeout"
      label="Request Timeout (s)"
      hint="5–300 seconds"
      type="number"
      @update:model-value="set('requestTimeout', Number($event))"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
