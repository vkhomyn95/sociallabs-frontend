<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { ViberBotTriggerParams } from '../index'

const props = defineProps<{ params: ViberBotTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberBotTriggerParams>] }>()

function set<K extends keyof ViberBotTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-vb-section">

    <!-- Mandatory -->
    <div class="slb-vb-group-label">Mandatory Events (always active)</div>

    <div class="slb-vb-mandatory-list">
      <div class="slb-vb-mandatory-list__item">
        <i class="fas fa-check-circle"></i>
        <span><strong>message</strong> — when a user sends a message to your bot</span>
      </div>
      <div class="slb-vb-mandatory-list__item">
        <i class="fas fa-check-circle"></i>
        <span><strong>subscribed</strong> — when a user subscribes (first message)</span>
      </div>
      <div class="slb-vb-mandatory-list__item">
        <i class="fas fa-check-circle"></i>
        <span><strong>unsubscribed</strong> — when a user blocks or leaves the bot</span>
      </div>
    </div>

    <div class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      Mandatory events cannot be disabled. The optional events below are sent to your webhook
      in addition to the mandatory ones.
    </div>

    <hr class="slb-vb-divider" />

    <!-- Optional -->
    <div class="slb-vb-group-label">Optional Events</div>

    <div class="slb-vb-options">
      <SlbCheckbox
        :model-value="params.eventConversationStarted"
        label="Conversation Started"
        description="When a user opens the bot for the first time using the deep link or info screen"
        @update:model-value="set('eventConversationStarted', $event)"
      />
      <SlbCheckbox
        :model-value="params.eventDelivered"
        label="Delivered"
        description="When the message is delivered to the user's device (can be multiple per message)"
        @update:model-value="set('eventDelivered', $event)"
      />
      <SlbCheckbox
        :model-value="params.eventSeen"
        label="Seen"
        description="When the user opens the conversation (fires once regardless of message count)"
        @update:model-value="set('eventSeen', $event)"
      />
      <SlbCheckbox
        :model-value="params.eventFailed"
        label="Failed"
        description="When message delivery fails after 14 days of retrying"
        @update:model-value="set('eventFailed', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
