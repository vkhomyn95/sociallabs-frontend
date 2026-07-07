<script setup lang="ts">
import {
  type WAClientTriggerParams,
  WA_CLIENT_TRIGGER_EVENT_OPTIONS,
  WA_CLIENT_TRIGGER_EVENT_DESCRIPTIONS,
  WAClientTriggerEvent,
} from '../index'

const props = defineProps<{ params: WAClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WAClientTriggerParams>] }>()

function toggle(value: WAClientTriggerEvent) {
  const current = [...props.params.triggerOn]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { triggerOn: current })
}

function isActive(value: WAClientTriggerEvent) {
  return props.params.triggerOn.includes(value)
}
</script>

<template>
  <div class="slb-wa-section">

    <div class="slb-wa-info">
      <i class="fab fa-whatsapp"></i>
      Select the WhatsApp Cloud API webhook events to listen for.
      Due to Meta API limitations, only <strong>one webhook per Facebook App</strong> is supported.
    </div>

    <div class="slb-wa-group-label">Trigger On</div>

    <div class="slb-wa-event-list">
      <div
        v-for="opt in WA_CLIENT_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        class="slb-wa-event-card"
        :class="{ 'slb-wa-event-card--active': isActive(opt.value as WAClientTriggerEvent) }"
        role="checkbox"
        :aria-checked="isActive(opt.value as WAClientTriggerEvent)"
        @click="toggle(opt.value as WAClientTriggerEvent)"
      >
        <div class="slb-wa-event-card__check">
          <i class="fas fa-check"></i>
        </div>
        <div class="slb-wa-event-card__body">
          <div class="slb-wa-event-card__title">{{ opt.label }}</div>
          <div class="slb-wa-event-card__desc">
            {{ WA_CLIENT_TRIGGER_EVENT_DESCRIPTIONS[opt.value as WAClientTriggerEvent] }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
