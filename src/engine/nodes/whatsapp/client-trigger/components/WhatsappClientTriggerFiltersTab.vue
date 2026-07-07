<script setup lang="ts">
import { computed } from 'vue'
import { SlbCheckbox, SlbInput } from '@/components/ui'
import {
  type WAClientTriggerParams,
  WA_CLIENT_MSG_TYPE_OPTIONS,
  WA_CLIENT_STATUS_OPTIONS,
  WAClientTriggerEvent,
  WAClientIncomingMessageType,
  WAClientMessageStatus,
} from '../index'

const props = defineProps<{ params: WAClientTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WAClientTriggerParams>] }>()

function set<K extends keyof WAClientTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const hasMessages = computed(() =>
  props.params.triggerOn.includes(WAClientTriggerEvent.MESSAGES)
)

function toggleMsgType(val: WAClientIncomingMessageType) {
  const current = [...props.params.messageTypes]
  const idx = current.indexOf(val)
  if (idx === -1) current.push(val)
  else current.splice(idx, 1)
  emit('update:params', { messageTypes: current })
}

function isMsgTypeActive(val: WAClientIncomingMessageType) {
  return props.params.messageTypes.includes(val)
}

function toggleStatus(val: WAClientMessageStatus) {
  const current = [...props.params.statuses]
  const idx = current.indexOf(val)
  if (idx === -1) current.push(val)
  else current.splice(idx, 1)
  emit('update:params', { statuses: current })
}

function isStatusActive(val: WAClientMessageStatus) {
  return props.params.statuses.includes(val)
}
</script>

<template>
  <div class="slb-wa-section">

    <!-- Message type filter — only shown when Messages event is selected -->
    <template v-if="hasMessages">
      <SlbCheckbox
        :model-value="params.filterMessageTypes"
        label="Filter by Message Type"
        description="Only trigger for specific incoming message types"
        @update:model-value="set('filterMessageTypes', $event)"
      />

      <template v-if="params.filterMessageTypes">
        <div class="slb-wa-group-label">Message Types</div>
        <div class="slb-wa-chip-row">
          <button
            v-for="opt in WA_CLIENT_MSG_TYPE_OPTIONS"
            :key="opt.value as string"
            type="button"
            class="slb-wa-chip"
            :class="{ 'slb-wa-chip--active': isMsgTypeActive(opt.value as WAClientIncomingMessageType) }"
            @click="toggleMsgType(opt.value as WAClientIncomingMessageType)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>

      <hr class="slb-wa-divider" />

      <!-- Status filter -->
      <SlbCheckbox
        :model-value="params.filterStatuses"
        label="Filter by Message Status"
        description="Only trigger on specific delivery status updates (sent, delivered, read, failed)"
        @update:model-value="set('filterStatuses', $event)"
      />

      <template v-if="params.filterStatuses">
        <div class="slb-wa-group-label">Statuses</div>
        <div class="slb-wa-chip-row">
          <button
            v-for="opt in WA_CLIENT_STATUS_OPTIONS"
            :key="opt.value as string"
            type="button"
            class="slb-wa-chip"
            :class="{ 'slb-wa-chip--active': isStatusActive(opt.value as WAClientMessageStatus) }"
            @click="toggleStatus(opt.value as WAClientMessageStatus)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>

      <hr class="slb-wa-divider" />
    </template>

    <!-- Phone Number ID filter -->
    <SlbCheckbox
      :model-value="params.filterPhoneNumbers"
      label="Filter by Phone Number ID"
      description="Only trigger for specific sender phone numbers"
      @update:model-value="set('filterPhoneNumbers', $event)"
    />

    <SlbInput
      v-if="params.filterPhoneNumbers"
      :model-value="params.phoneNumberIds"
      label="Phone Number IDs"
      placeholder="123456789, 987654321"
      hint="Comma-separated Phone Number IDs from Meta Business Manager"
      @update:model-value="set('phoneNumberIds', String($event))"
    />

    <hr class="slb-wa-divider" />

    <!-- Sender filter -->
    <SlbCheckbox
      :model-value="params.filterSenders"
      label="Filter by Sender Phone Number"
      description="Only trigger for messages from specific customer phone numbers"
      @update:model-value="set('filterSenders', $event)"
    />

    <SlbInput
      v-if="params.filterSenders"
      :model-value="params.senderPhones"
      label="Sender Phone Numbers"
      placeholder="+14155552671, +380501234567"
      hint="Comma-separated numbers with country code"
      @update:model-value="set('senderPhones', String($event))"
    />

    <hr class="slb-wa-divider" />

    <!-- Downloads -->
    <div class="slb-wa-group-label">Auto-Download Media</div>

    <div class="slb-wa-options">
      <SlbCheckbox
        :model-value="params.downloadImages"
        label="Images"
        description="Download received image messages as binary data"
        @update:model-value="set('downloadImages', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVideos"
        label="Videos"
        description="Download received video messages as binary data"
        @update:model-value="set('downloadVideos', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadAudio"
        label="Audio"
        description="Download received audio and voice messages as binary data"
        @update:model-value="set('downloadAudio', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadDocuments"
        label="Documents"
        description="Download received document messages as binary data"
        @update:model-value="set('downloadDocuments', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
