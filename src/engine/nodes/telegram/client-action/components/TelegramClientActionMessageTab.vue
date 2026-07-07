<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type TelegramClientActionParams,
  CLIENT_RESOURCE_OPTIONS,
  CLIENT_OPERATION_OPTIONS,
  CLIENT_PARSE_MODE_OPTIONS,
  CLIENT_ATTACHMENT_OPTIONS,
  CLIENT_POLL_TYPE_OPTIONS,
  CLIENT_DICE_OPTIONS,
  CLIENT_CHAT_ACTION_OPTIONS,
  TelegramClientResource,
  TelegramClientOperation,
  TelegramClientAttachmentType,
  MEDIA_RESOURCES,
  CAPTION_RESOURCES,
  SPOILER_RESOURCES,
  LOCATION_RESOURCES,
  EDIT_OPERATIONS,
} from '../index'

const props = defineProps<{ params: TelegramClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramClientActionParams>] }>()

function set<K extends keyof TelegramClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const r = computed(() => props.params.resource as TelegramClientResource)
const op = computed(() => props.params.operation as TelegramClientOperation)

const isMessage     = computed(() => r.value === TelegramClientResource.MESSAGE)
const isMedia       = computed(() => MEDIA_RESOURCES.includes(r.value))
const hasCaption    = computed(() => CAPTION_RESOURCES.includes(r.value))
const hasSpoiler    = computed(() => SPOILER_RESOURCES.includes(r.value))
const isLocation    = computed(() => LOCATION_RESOURCES.includes(r.value))
const isContact     = computed(() => r.value === TelegramClientResource.CONTACT)
const isVenue       = computed(() => r.value === TelegramClientResource.VENUE)
const isPoll        = computed(() => r.value === TelegramClientResource.POLL)
const isDice        = computed(() => r.value === TelegramClientResource.DICE)
const isVideo       = computed(() => r.value === TelegramClientResource.VIDEO)
const isAudio       = computed(() => r.value === TelegramClientResource.AUDIO)
const isPhoto       = computed(() => r.value === TelegramClientResource.PHOTO)
const isEditOp      = computed(() => EDIT_OPERATIONS.includes(op.value))
const isForwardOp   = computed(() => op.value === TelegramClientOperation.FORWARD)
const isTypingOp    = computed(() => op.value === TelegramClientOperation.SEND_TYPING)
const isLiveLocation = computed(() => r.value === TelegramClientResource.LOCATION)

const showLocal  = computed(() => props.params.attachmentType === TelegramClientAttachmentType.LOCAL)
const showRemote = computed(() => props.params.attachmentType === TelegramClientAttachmentType.REMOTE)
const showFileId = computed(() => props.params.attachmentType === TelegramClientAttachmentType.FILE_ID)
</script>

<template>
  <div class="slb-tg-section">

    <!-- Resource + Operation -->
    <div class="slb-tg-row">
      <SlbSelect
        :model-value="params.resource"
        :options="CLIENT_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="params.operation"
        :options="CLIENT_OPERATION_OPTIONS"
        label="Operation"
        @update:model-value="set('operation', $event)"
      />
    </div>

    <!-- Chat ID -->
    <SlbInput
      :model-value="params.chatId"
      label="Chat ID"
      placeholder="123456789 or {{chatId}}"
      hint="Use numeric ID or expression"
      @update:model-value="set('chatId', String($event))"
    />

    <!-- ── Message ── -->
    <template v-if="isMessage">
      <div class="slb-tg-field">
        <label class="slb-tg-label">
          Message
          <span class="slb-tg-label__required">*</span>
        </label>
        <textarea
          :value="params.text"
          class="slb-tg-textarea"
          rows="6"
          placeholder="Enter your message... Supports {{$json.text}} expressions"
          @input="set('text', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <SlbSelect
        :model-value="params.parseMode"
        :options="CLIENT_PARSE_MODE_OPTIONS"
        label="Parse Mode"
        @update:model-value="set('parseMode', $event)"
      />

      <SlbCheckbox
        :model-value="params.disableWebPagePreview"
        label="Disable Link Preview"
        @update:model-value="set('disableWebPagePreview', $event)"
      />

      <SlbCheckbox
        :model-value="params.clearDraft"
        label="Clear Draft"
        description="Clear draft after sending"
        @update:model-value="set('clearDraft', $event)"
      />
    </template>

    <!-- ── Media ── -->
    <template v-if="isMedia">
      <SlbSelect
        :model-value="params.attachmentType"
        :options="CLIENT_ATTACHMENT_OPTIONS"
        label="Media Source"
        @update:model-value="set('attachmentType', $event)"
      />

      <SlbInput
        v-if="showLocal"
        :model-value="params.localFilePath"
        label="Local File Path"
        placeholder="/path/to/file.jpg"
        @update:model-value="set('localFilePath', String($event))"
      />

      <SlbInput
        v-if="showRemote"
        :model-value="params.remoteFileUrl"
        label="Remote URL"
        placeholder="https://example.com/file.jpg"
        @update:model-value="set('remoteFileUrl', String($event))"
      />

      <SlbInput
        v-if="showFileId"
        :model-value="params.fileId ?? ''"
        label="File ID"
        placeholder="123456789"
        type="number"
        @update:model-value="set('fileId', Number($event))"
      />

      <div v-if="hasCaption" class="slb-tg-field">
        <label class="slb-tg-label">Caption</label>
        <textarea
          :value="params.caption"
          class="slb-tg-textarea"
          rows="3"
          placeholder="Add a caption..."
          @input="set('caption', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <SlbCheckbox
        v-if="hasSpoiler"
        :model-value="params.hasSpoiler"
        label="Has Spoiler"
        description="Mark media as spoiler"
        @update:model-value="set('hasSpoiler', $event)"
      />

      <!-- Photo specific -->
      <SlbInput
        v-if="isPhoto"
        :model-value="params.photoCompressionQuality"
        label="Compression Quality"
        hint="1–100, default 85"
        type="number"
        @update:model-value="set('photoCompressionQuality', Number($event))"
      />

      <!-- Video specific -->
      <template v-if="isVideo">
        <div class="slb-tg-row-3">
          <SlbInput
            :model-value="params.duration ?? ''"
            label="Duration (s)"
            type="number"
            @update:model-value="set('duration', Number($event))"
          />
          <SlbInput
            :model-value="params.width ?? ''"
            label="Width"
            type="number"
            @update:model-value="set('width', Number($event))"
          />
          <SlbInput
            :model-value="params.height ?? ''"
            label="Height"
            type="number"
            @update:model-value="set('height', Number($event))"
          />
        </div>
        <SlbCheckbox
          :model-value="params.supportsStreaming"
          label="Supports Streaming"
          @update:model-value="set('supportsStreaming', $event)"
        />
      </template>

      <!-- Audio specific -->
      <template v-if="isAudio">
        <div class="slb-tg-row">
          <SlbInput
            :model-value="params.performer"
            label="Performer"
            placeholder="Artist Name"
            @update:model-value="set('performer', String($event))"
          />
          <SlbInput
            :model-value="params.title"
            label="Title"
            placeholder="Track Title"
            @update:model-value="set('title', String($event))"
          />
        </div>
        <SlbInput
          :model-value="params.duration ?? ''"
          label="Duration (s)"
          type="number"
          @update:model-value="set('duration', Number($event))"
        />
      </template>
    </template>

    <!-- ── Location ── -->
    <template v-if="isLocation">
      <div class="slb-tg-row">
        <SlbInput
          :model-value="params.latitude ?? ''"
          label="Latitude"
          placeholder="-90 to 90"
          type="number"
          @update:model-value="set('latitude', Number($event))"
        />
        <SlbInput
          :model-value="params.longitude ?? ''"
          label="Longitude"
          placeholder="-180 to 180"
          type="number"
          @update:model-value="set('longitude', Number($event))"
        />
      </div>
      <SlbInput
        v-if="isLiveLocation"
        :model-value="params.livePeriod ?? ''"
        label="Live Period (s)"
        hint="60–86400 seconds"
        type="number"
        @update:model-value="set('livePeriod', Number($event))"
      />
    </template>

    <!-- ── Venue ── -->
    <template v-if="isVenue">
      <div class="slb-tg-row">
        <SlbInput
          :model-value="params.latitude ?? ''"
          label="Latitude"
          type="number"
          @update:model-value="set('latitude', Number($event))"
        />
        <SlbInput
          :model-value="params.longitude ?? ''"
          label="Longitude"
          type="number"
          @update:model-value="set('longitude', Number($event))"
        />
      </div>
      <SlbInput
        :model-value="params.venueName"
        label="Venue Name"
        placeholder="Restaurant Name"
        @update:model-value="set('venueName', String($event))"
      />
      <SlbInput
        :model-value="params.address"
        label="Address"
        placeholder="123 Main St"
        @update:model-value="set('address', String($event))"
      />
    </template>

    <!-- ── Contact ── -->
    <template v-if="isContact">
      <SlbInput
        :model-value="params.phoneNumber"
        label="Phone Number"
        placeholder="+1234567890"
        @update:model-value="set('phoneNumber', String($event))"
      />
      <div class="slb-tg-row">
        <SlbInput
          :model-value="params.firstName"
          label="First Name"
          placeholder="John"
          @update:model-value="set('firstName', String($event))"
        />
        <SlbInput
          :model-value="params.lastName"
          label="Last Name"
          placeholder="Doe"
          @update:model-value="set('lastName', String($event))"
        />
      </div>
    </template>

    <!-- ── Poll ── -->
    <template v-if="isPoll">
      <SlbInput
        :model-value="params.question"
        label="Question"
        placeholder="What is your favorite color?"
        @update:model-value="set('question', String($event))"
      />
      <div class="slb-tg-field">
        <label class="slb-tg-label">
          Options (JSON array)
          <span class="slb-tg-label__required">*</span>
        </label>
        <textarea
          :value="params.pollOptions"
          class="slb-tg-textarea"
          rows="3"
          placeholder='["Red", "Blue", "Green"]'
          @input="set('pollOptions', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
      <div class="slb-tg-row">
        <SlbSelect
          :model-value="params.pollType"
          :options="CLIENT_POLL_TYPE_OPTIONS"
          label="Poll Type"
          @update:model-value="set('pollType', $event)"
        />
      </div>
      <SlbCheckbox
        :model-value="params.isAnonymous"
        label="Anonymous Poll"
        @update:model-value="set('isAnonymous', $event)"
      />
    </template>

    <!-- ── Dice ── -->
    <template v-if="isDice">
      <SlbSelect
        :model-value="params.diceEmoji"
        :options="CLIENT_DICE_OPTIONS"
        label="Dice Emoji"
        @update:model-value="set('diceEmoji', $event)"
      />
    </template>

    <!-- ── Edit / Delete / Pin ── -->
    <template v-if="isEditOp">
      <SlbInput
        :model-value="params.messageId"
        label="Message ID"
        placeholder="123456"
        @update:model-value="set('messageId', String($event))"
      />
    </template>

    <!-- ── Forward ── -->
    <template v-if="isForwardOp">
      <SlbInput
        :model-value="params.fromChatId"
        label="From Chat ID"
        placeholder="123456789"
        @update:model-value="set('fromChatId', String($event))"
      />
      <div class="slb-tg-field">
        <label class="slb-tg-label">Message IDs (JSON array)</label>
        <textarea
          :value="params.messageIds"
          class="slb-tg-textarea"
          rows="2"
          placeholder="[123, 456, 789]"
          @input="set('messageIds', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
      <SlbCheckbox
        :model-value="params.sendCopy"
        label="Send as Copy"
        description="Forward without author info"
        @update:model-value="set('sendCopy', $event)"
      />
    </template>

    <!-- ── Typing ── -->
    <template v-if="isTypingOp">
      <SlbSelect
        :model-value="params.chatAction"
        :options="CLIENT_CHAT_ACTION_OPTIONS"
        label="Chat Action"
        @update:model-value="set('chatAction', $event)"
      />
    </template>

    <!-- Reply To -->
    <SlbInput
      :model-value="params.replyToMessageId ?? ''"
      label="Reply To Message ID"
      placeholder="123456 (optional)"
      type="number"
      @update:model-value="set('replyToMessageId', $event ? Number($event) : null)"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
