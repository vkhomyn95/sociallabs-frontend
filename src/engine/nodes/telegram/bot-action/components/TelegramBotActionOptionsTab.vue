<script setup lang="ts">
import { SlbCheckbox, SlbInput } from '@/components/ui'
import type { TelegramBotActionParams } from '../index'

const props = defineProps<{ params: TelegramBotActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramBotActionParams>] }>()

function set<K extends keyof TelegramBotActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-tg-options">

    <SlbCheckbox
      :model-value="params.disableNotification"
      label="Send Silently"
      description="Send without pushing notification to recipients"
      @update:model-value="set('disableNotification', $event)"
    />

    <SlbCheckbox
      :model-value="params.protectContent"
      label="Protect Content"
      description="Prevent forwarding and saving"
      @update:model-value="set('protectContent', $event)"
    />

    <SlbCheckbox
      :model-value="params.continueOnFail"
      label="Continue on Fail"
      description="Continue workflow execution even if this node fails"
      @update:model-value="set('continueOnFail', $event)"
    />

    <SlbInput
      :model-value="params.retryAttempts"
      label="Retry Attempts"
      hint="Number of retry attempts on failure (0–5)"
      type="number"
      @update:model-value="set('retryAttempts', Number($event))"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
