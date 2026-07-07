<script setup lang="ts">
import { SlbCheckbox, SlbInput } from '@/components/ui'
import type { TelegramClientTriggerParams } from '../index'

const props = defineProps<{ params: TelegramClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramClientTriggerParams>] }>()

function set<K extends keyof TelegramClientTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-tg-section">

    <!-- Chat type filters -->
    <div class="slb-tg-group-label">Chat Types</div>

    <div class="slb-tg-options">
      <SlbCheckbox
        :model-value="params.onlyPrivate"
        label="Private Chats Only"
        description="Trigger only for messages from private chats"
        @update:model-value="set('onlyPrivate', $event)"
      />
      <SlbCheckbox
        :model-value="params.onlyGroups"
        label="Groups Only"
        description="Trigger only for messages from groups and supergroups"
        @update:model-value="set('onlyGroups', $event)"
      />
      <SlbCheckbox
        :model-value="params.onlyChannels"
        label="Channels Only"
        description="Trigger only for posts from channels"
        @update:model-value="set('onlyChannels', $event)"
      />
    </div>

    <hr class="slb-tg-divider" />

    <!-- Chat ID filter -->
    <SlbCheckbox
      :model-value="params.filterChats"
      label="Filter by Chat IDs"
      description="Only trigger for specific chats"
      @update:model-value="set('filterChats', $event)"
    />

    <SlbInput
      v-if="params.filterChats"
      :model-value="params.chatIds"
      label="Chat IDs"
      placeholder="123456789, -100987654321"
      hint="Comma-separated list of chat IDs"
      @update:model-value="set('chatIds', String($event))"
    />

    <hr class="slb-tg-divider" />

    <!-- Sender filter -->
    <SlbCheckbox
      :model-value="params.filterSenders"
      label="Filter by Sender IDs"
      description="Only trigger for messages from specific users"
      @update:model-value="set('filterSenders', $event)"
    />

    <SlbInput
      v-if="params.filterSenders"
      :model-value="params.senderIds"
      label="Sender IDs"
      placeholder="123456789, 987654321"
      hint="Comma-separated list of user IDs"
      @update:model-value="set('senderIds', String($event))"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
