<script setup lang="ts">
import { SlbCheckbox, SlbInput } from '@/components/ui'
import type { TelegramClientActionParams } from '../index'

const props = defineProps<{ params: TelegramClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramClientActionParams>] }>()

function set<K extends keyof TelegramClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-tg-section">

    <div class="slb-tg-group-label">Send Options</div>

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
    </div>

    <SlbInput
      :model-value="params.messageThreadId ?? ''"
      label="Message Thread ID"
      hint="Thread/topic ID in supergroup (optional)"
      type="number"
      @update:model-value="set('messageThreadId', $event ? Number($event) : null)"
    />

    <hr class="slb-tg-divider" />
    <div class="slb-tg-group-label">Advanced</div>

    <div class="slb-tg-options">
      <SlbCheckbox
        :model-value="params.continueOnFail"
        label="Continue on Fail"
        description="Continue workflow execution even if this node fails"
        @update:model-value="set('continueOnFail', $event)"
      />
    </div>

    <div class="slb-tg-row">
      <SlbInput
        :model-value="params.retryAttempts"
        label="Retry Attempts"
        hint="0–5"
        type="number"
        @update:model-value="set('retryAttempts', Number($event))"
      />
      <SlbInput
        :model-value="params.requestTimeout"
        label="Timeout (s)"
        hint="5–300 seconds"
        type="number"
        @update:model-value="set('requestTimeout', Number($event))"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
