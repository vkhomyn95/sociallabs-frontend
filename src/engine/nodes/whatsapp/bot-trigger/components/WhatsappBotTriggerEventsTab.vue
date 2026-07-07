<script setup lang="ts">
import {
  type WhatsAppTriggerParams,
  WA_TRIGGER_EVENT_OPTIONS,
  WA_TRIGGER_EVENT_DESCRIPTIONS,
  WhatsAppTriggerEvent,
} from '../index'

const props = defineProps<{ params: WhatsAppTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WhatsAppTriggerParams>] }>()

function toggle(value: WhatsAppTriggerEvent) {
  const current = [...props.params.triggerOn]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { triggerOn: current })
}

function isActive(value: WhatsAppTriggerEvent) {
  return props.params.triggerOn.includes(value)
}
</script>

<template>
  <div class="slb-wa-section">

    <div class="slb-wa-info">
      <i class="fab fa-whatsapp"></i>
      Select the WhatsApp Business events to listen for. You can select multiple.
      Due to Meta API limitations, only <strong>one webhook per Facebook App</strong> is supported.
    </div>

    <div class="slb-wa-group-label">Trigger On</div>

    <div class="slb-wa-event-list">
      <div
        v-for="opt in WA_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        class="slb-wa-event-card"
        :class="{ 'slb-wa-event-card--active': isActive(opt.value as WhatsAppTriggerEvent) }"
        role="checkbox"
        :aria-checked="isActive(opt.value as WhatsAppTriggerEvent)"
        @click="toggle(opt.value as WhatsAppTriggerEvent)"
      >
        <div class="slb-wa-event-card__check">
          <i class="fas fa-check"></i>
        </div>
        <div class="slb-wa-event-card__body">
          <div class="slb-wa-event-card__title">{{ opt.label }}</div>
          <div class="slb-wa-event-card__desc">
            {{ WA_TRIGGER_EVENT_DESCRIPTIONS[opt.value as WhatsAppTriggerEvent] }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
