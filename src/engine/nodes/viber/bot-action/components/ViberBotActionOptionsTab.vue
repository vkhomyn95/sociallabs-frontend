<script setup lang="ts">
import { SlbCheckbox, SlbInput } from '@/components/ui'
import type { ViberBotActionParams } from '../index'

const props = defineProps<{ params: ViberBotActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberBotActionParams>] }>()

function set<K extends keyof ViberBotActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-vb-section">

    <div class="slb-vb-group-label">API Settings</div>

    <SlbInput
      :model-value="params.minApiVersion ?? ''"
      label="Min API Version"
      hint="Minimum Viber client version required (e.g. 7 for Rich Media)"
      type="number"
      @update:model-value="set('minApiVersion', $event ? Number($event) : null)"
    />

    <hr class="slb-vb-divider" />
    <div class="slb-vb-group-label">Advanced</div>

    <div class="slb-vb-options">
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
