<script setup lang="ts">
import { SlbInput, SlbCheckbox } from '@/components/ui'
import {
  type MessengerTriggerParams,
  MESSENGER_TRIGGER_EVENT_OPTIONS,
  MESSENGER_TRIGGER_EVENT_DESCRIPTIONS,
  MessengerTriggerEvent,
} from '../index'

const props = defineProps<{ params: MessengerTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<MessengerTriggerParams>] }>()

function set<K extends keyof MessengerTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

function toggle(value: MessengerTriggerEvent) {
  const current = [...props.params.triggerOn]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { triggerOn: current })
}

function isActive(value: MessengerTriggerEvent) {
  return props.params.triggerOn.includes(value)
}
</script>

<template>
  <div class="slb-ms-section">

    <SlbInput
      :model-value="params.pageId"
      label="Facebook Page ID"
      placeholder="Your Facebook Page ID"
      hint="The Page whose events this node will listen to"
      @update:model-value="set('pageId', String($event))"
    />

    <div class="slb-ms-info">
      <i class="fab fa-facebook-messenger"></i>
      Select the Messenger webhook subscription fields to listen for.
      At least one event must be selected. Events must also be subscribed
      in your Meta App Dashboard under Messenger → Webhooks.
    </div>

    <div class="slb-ms-group-label">Trigger On</div>

    <div class="slb-ms-event-list">
      <div
        v-for="opt in MESSENGER_TRIGGER_EVENT_OPTIONS"
        :key="opt.value as string"
        class="slb-ms-event-card"
        :class="{ 'slb-ms-event-card--active': isActive(opt.value as MessengerTriggerEvent) }"
        role="checkbox"
        :aria-checked="isActive(opt.value as MessengerTriggerEvent)"
        @click="toggle(opt.value as MessengerTriggerEvent)"
      >
        <div class="slb-ms-event-card__check">
          <i class="fas fa-check"></i>
        </div>
        <div class="slb-ms-event-card__body">
          <div class="slb-ms-event-card__title">{{ opt.label }}</div>
          <div class="slb-ms-event-card__desc">
            {{ MESSENGER_TRIGGER_EVENT_DESCRIPTIONS[opt.value as MessengerTriggerEvent] }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
