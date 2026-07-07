<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import { type TelegramBotTriggerParams, BOT_TRIGGER_EVENT_OPTIONS, TelegramBotTriggerEvent } from '../index'

const props = defineProps<{ params: TelegramBotTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramBotTriggerParams>] }>()

function toggleEvent(value: TelegramBotTriggerEvent) {
  const current = [...props.params.updates]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { updates: current })
}

function isChecked(value: TelegramBotTriggerEvent) {
  return props.params.updates.includes(value)
}
</script>

<template>
  <div class="slb-tg-section">

    <div class="slb-tg-info">
      <i class="fas fa-info-circle"></i>
      Select the Telegram update types that will trigger this workflow. At least one event is required.
    </div>

    <div class="slb-tg-group-label">Update Types</div>

    <div class="slb-tg-options">
      <SlbCheckbox
        v-for="opt in BOT_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        :model-value="isChecked(opt.value as TelegramBotTriggerEvent)"
        :label="opt.label"
        @update:model-value="toggleEvent(opt.value as TelegramBotTriggerEvent)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
