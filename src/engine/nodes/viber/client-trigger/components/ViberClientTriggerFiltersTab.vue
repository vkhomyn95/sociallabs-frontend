<script setup lang="ts">
import { computed } from 'vue'
import { SlbCheckbox, SlbInput } from '@/components/ui'
import {
  type ViberClientTriggerParams,
  CLIENT_MESSAGE_TYPE_OPTIONS,
  ViberClientTriggerEvent,
  ViberClientMessageType,
} from '../index'

const props = defineProps<{ params: ViberClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberClientTriggerParams>] }>()

function set<K extends keyof ViberClientTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const hasMessageEvent = computed(() =>
  props.params.events.includes(ViberClientTriggerEvent.MESSAGE)
)

function toggleMsgType(value: ViberClientMessageType) {
  const current = [...props.params.messageTypes]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:params', { messageTypes: current })
}

function isMsgTypeChecked(value: ViberClientMessageType) {
  return props.params.messageTypes.includes(value)
}
</script>

<template>
  <div class="slb-vb-section">

    <!-- Message type filter (only relevant when MESSAGE event is selected) -->
    <template v-if="hasMessageEvent">
      <SlbCheckbox
        :model-value="params.filterMessageTypes"
        label="Filter by Message Type"
        description="Only trigger for specific incoming message types"
        @update:model-value="set('filterMessageTypes', $event)"
      />

      <template v-if="params.filterMessageTypes">
        <div class="slb-vb-group-label">Message Types</div>
        <div class="slb-vb-chip-list">
          <button
            v-for="opt in CLIENT_MESSAGE_TYPE_OPTIONS"
            :key="opt.value as string"
            class="slb-vb-chip"
            :class="{ 'slb-vb-chip--active': isMsgTypeChecked(opt.value as ViberClientMessageType) }"
            type="button"
            @click="toggleMsgType(opt.value as ViberClientMessageType)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>

      <hr class="slb-vb-divider" />
    </template>

    <!-- Chat filter -->
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
      placeholder="id1, id2, id3"
      hint="Comma-separated Viber chat IDs"
      @update:model-value="set('chatIds', String($event))"
    />

    <hr class="slb-vb-divider" />

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
      placeholder="userId1, userId2"
      hint="Comma-separated Viber user IDs"
      @update:model-value="set('senderIds', String($event))"
    />

    <hr class="slb-vb-divider" />

    <!-- Downloads -->
    <div class="slb-vb-group-label">Auto-Download Media</div>

    <div class="slb-vb-options">
      <SlbCheckbox
        :model-value="params.downloadImages"
        label="Images"
        description="Download received picture messages"
        @update:model-value="set('downloadImages', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVideos"
        label="Videos"
        description="Download received video messages"
        @update:model-value="set('downloadVideos', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadFiles"
        label="Files"
        description="Download received file messages"
        @update:model-value="set('downloadFiles', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
