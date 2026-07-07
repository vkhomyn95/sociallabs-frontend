<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import {
  type ViberClientTriggerParams,
  CLIENT_TRIGGER_EVENT_OPTIONS,
  ViberClientTriggerEvent,
} from '../index'

const props = defineProps<{ params: ViberClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberClientTriggerParams>] }>()

function toggleEvent(value: ViberClientTriggerEvent) {
  const current = [...props.params.events]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { events: current })
}

function isChecked(value: ViberClientTriggerEvent) {
  return props.params.events.includes(value)
}
</script>

<template>
  <div class="slb-vb-section">

    <div class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      Select Viber events that will trigger this workflow.
      At least one event must be selected.
    </div>

    <div class="slb-vb-group-label">Trigger Events</div>

    <div class="slb-vb-options">
      <SlbCheckbox
        v-for="opt in CLIENT_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        :model-value="isChecked(opt.value as ViberClientTriggerEvent)"
        :label="opt.label"
        @update:model-value="toggleEvent(opt.value as ViberClientTriggerEvent)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
