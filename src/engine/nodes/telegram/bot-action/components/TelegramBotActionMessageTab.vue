<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type TelegramBotActionParams,
  BOT_RESOURCE_OPTIONS,
  BOT_OPERATION_OPTIONS,
  BOT_PARSE_MODE_OPTIONS,
  BOT_ATTACHMENT_OPTIONS,
  TelegramBotResource,
  MEDIA_RESOURCES,
  CAPTION_RESOURCES,
  LOCATION_RESOURCES,
} from '../index'

const props = defineProps<{ params: TelegramBotActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramBotActionParams>] }>()

function set<K extends keyof TelegramBotActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const isMessage  = computed(() => props.params.resource === TelegramBotResource.MESSAGE)
const isMedia    = computed(() => MEDIA_RESOURCES.includes(props.params.resource as TelegramBotResource))
const hasCaption = computed(() => CAPTION_RESOURCES.includes(props.params.resource as TelegramBotResource))
const isLocation = computed(() => LOCATION_RESOURCES.includes(props.params.resource as TelegramBotResource))
const isContact  = computed(() => props.params.resource === TelegramBotResource.CONTACT)
const isPoll     = computed(() => props.params.resource === TelegramBotResource.POLL)
const isVenue    = computed(() => props.params.resource === TelegramBotResource.VENUE)
const showUrl    = computed(() => props.params.attachmentType === 'url')
const showFileId = computed(() => props.params.attachmentType === 'FILE_ID')
</script>

<template>
  <div class="slb-tg-section">

    <!-- Resource + Operation -->
    <div class="slb-tg-row">
      <SlbSelect
        :model-value="params.resource"
        :options="BOT_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="params.operation"
        :options="BOT_OPERATION_OPTIONS"
        label="Operation"
        @update:model-value="set('operation', $event)"
      />
    </div>

    <!-- Chat ID -->
    <SlbInput
      :model-value="params.chatId"
      label="Chat ID"
      placeholder="@username or 123456789"
      hint="Chat ID, username (@channel) or expression {{$json.chatId}}"
      @update:model-value="set('chatId', String($event))"
    />

    <!-- ── Message ── -->
    <template v-if="isMessage">
      <div class="slb-tg-field">
        <label class="slb-tg-label">
          Message Text
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
        :options="BOT_PARSE_MODE_OPTIONS"
        label="Parse Mode"
        @update:model-value="set('parseMode', $event)"
      />

      <SlbCheckbox
        :model-value="params.disableWebPagePreview"
        label="Disable Link Preview"
        @update:model-value="set('disableWebPagePreview', $event)"
      />
    </template>

    <!-- ── Media ── -->
    <template v-if="isMedia">
      <SlbSelect
        :model-value="params.attachmentType"
        :options="BOT_ATTACHMENT_OPTIONS"
        label="Media Source"
        @update:model-value="set('attachmentType', $event)"
      />

      <SlbInput
        v-if="showUrl"
        :model-value="params.mediaUrl"
        label="Media URL"
        placeholder="https://example.com/file.jpg"
        @update:model-value="set('mediaUrl', String($event))"
      />

      <SlbInput
        v-if="showFileId"
        :model-value="params.mediaFileId"
        label="File ID"
        placeholder="AgACAgIAAxkBAAI..."
        @update:model-value="set('mediaFileId', String($event))"
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
    </template>

    <!-- ── Location / Venue ── -->
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
    </template>

    <template v-if="isVenue">
      <SlbInput
        :model-value="params.firstName"
        label="Venue Name"
        placeholder="Restaurant Name"
        @update:model-value="set('firstName', String($event))"
      />
      <SlbInput
        :model-value="params.lastName"
        label="Address"
        placeholder="123 Main St"
        @update:model-value="set('lastName', String($event))"
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
          Options
          <span class="slb-tg-label__required">*</span>
        </label>
        <textarea
          :value="params.pollOptions"
          class="slb-tg-textarea"
          rows="4"
          placeholder="Red&#10;Blue&#10;Green"
          @input="set('pollOptions', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
      <SlbCheckbox
        :model-value="params.isAnonymous"
        label="Anonymous Poll"
        @update:model-value="set('isAnonymous', $event)"
      />
    </template>

    <!-- Reply To -->
    <SlbInput
      :model-value="params.replyToMessageId"
      label="Reply To Message ID"
      placeholder="123456 (optional)"
      @update:model-value="set('replyToMessageId', String($event))"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
