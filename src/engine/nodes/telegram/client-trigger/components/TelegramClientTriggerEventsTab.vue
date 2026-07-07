<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import {
  type TelegramClientTriggerParams,
  CLIENT_TRIGGER_EVENT_OPTIONS,
  TelegramClientTriggerEvent,
} from '../index'

const props = defineProps<{ params: TelegramClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramClientTriggerParams>] }>()

function toggleEvent(value: TelegramClientTriggerEvent) {
  const current = [...props.params.events]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { events: current })
}

function isChecked(value: TelegramClientTriggerEvent) {
  return props.params.events.includes(value)
}
</script>

<template>
  <div class="slb-tg-section">

    <div class="slb-tg-info">
      <i class="fas fa-info-circle"></i>
      Select MTProto events that will trigger this workflow. Uses your Telegram account (not a bot).
      At least one event is required.
    </div>

    <div class="slb-tg-group-label">Trigger Events</div>

    <div class="slb-tg-options">
      <SlbCheckbox
        v-for="opt in CLIENT_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        :model-value="isChecked(opt.value as TelegramClientTriggerEvent)"
        :label="opt.label"
        @update:model-value="toggleEvent(opt.value as TelegramClientTriggerEvent)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
