<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect } from '@/components/ui'
import {
  type ViberClientActionParams,
  VIBER_CLIENT_RESOURCE_OPTIONS,
  VIBER_CLIENT_OPERATION_OPTIONS,
  ViberClientResource,
  ViberClientOperation,
  SEND_OPERATIONS,
  MSG_OPERATIONS,
} from '../index'

const props = defineProps<{ params: ViberClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberClientActionParams>] }>()

function set<K extends keyof ViberClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const r  = computed(() => props.params.resource  as ViberClientResource)
const op = computed(() => props.params.operation as ViberClientOperation)

const isSendOp      = computed(() => SEND_OPERATIONS.includes(op.value))
const isMsgOp       = computed(() => MSG_OPERATIONS.includes(op.value))
const isGetHistory  = computed(() => op.value === ViberClientOperation.GET_HISTORY)
const isGetInfo     = computed(() => op.value === ViberClientOperation.GET_INFO)
const isMarkRead    = computed(() => op.value === ViberClientOperation.MARK_READ)

const isText      = computed(() => r.value === ViberClientResource.TEXT)
const isPicture   = computed(() => r.value === ViberClientResource.PICTURE)
const isVideo     = computed(() => r.value === ViberClientResource.VIDEO)
const isFile      = computed(() => r.value === ViberClientResource.FILE)
const isLocation  = computed(() => r.value === ViberClientResource.LOCATION)
const isContact   = computed(() => r.value === ViberClientResource.CONTACT)
const isSticker   = computed(() => r.value === ViberClientResource.STICKER)
const isUrl       = computed(() => r.value === ViberClientResource.URL)
const isRichMedia = computed(() => r.value === ViberClientResource.RICH_MEDIA)
</script>

<template>
  <div class="slb-vb-section">

    <!-- Resource + Operation -->
    <div class="slb-vb-row">
      <SlbSelect
        :model-value="params.resource"
        :options="VIBER_CLIENT_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="params.operation"
        :options="VIBER_CLIENT_OPERATION_OPTIONS"
        label="Operation"
        @update:model-value="set('operation', $event)"
      />
    </div>

    <!-- Chat ID — always -->
    <SlbInput
      :model-value="params.chatId"
      label="Chat ID"
      placeholder="Viber chat or user ID"
      hint="Use ID from conversation or event callback"
      @update:model-value="set('chatId', String($event))"
    />

    <!-- ── Send content ── -->
    <template v-if="isSendOp">

      <!-- Text -->
      <template v-if="isText">
        <div class="slb-vb-field">
          <label class="slb-vb-label">
            Text
            <span class="slb-vb-label__required">*</span>
          </label>
          <textarea
            :value="params.text"
            class="slb-vb-textarea"
            rows="6"
            placeholder="Enter your message..."
            @input="set('text', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- Picture -->
      <template v-if="isPicture">
        <SlbInput
          :model-value="params.pictureUrl"
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          hint="JPEG only, max 1 MB"
          @update:model-value="set('pictureUrl', String($event))"
        />
        <SlbInput
          :model-value="params.pictureThumbnail"
          label="Thumbnail URL"
          placeholder="https://example.com/thumb.jpg"
          @update:model-value="set('pictureThumbnail', String($event))"
        />
        <div class="slb-vb-field">
          <label class="slb-vb-label">Caption</label>
          <textarea
            :value="params.pictureCaption"
            class="slb-vb-textarea"
            rows="2"
            placeholder="Optional caption"
            @input="set('pictureCaption', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- Video -->
      <template v-if="isVideo">
        <SlbInput
          :model-value="params.videoUrl"
          label="Video URL"
          placeholder="https://example.com/video.mp4"
          hint=".mp4 only, max 50 MB"
          @update:model-value="set('videoUrl', String($event))"
        />
        <SlbInput
          :model-value="params.videoThumbnail"
          label="Thumbnail URL"
          placeholder="https://example.com/thumb.jpg"
          @update:model-value="set('videoThumbnail', String($event))"
        />
        <div class="slb-vb-row">
          <SlbInput
            :model-value="params.videoSize ?? ''"
            label="File Size (bytes)"
            type="number"
            @update:model-value="set('videoSize', $event ? Number($event) : null)"
          />
          <SlbInput
            :model-value="params.videoDuration ?? ''"
            label="Duration (s)"
            type="number"
            @update:model-value="set('videoDuration', $event ? Number($event) : null)"
          />
        </div>
      </template>

      <!-- File -->
      <template v-if="isFile">
        <SlbInput
          :model-value="params.fileUrl"
          label="File URL"
          placeholder="https://example.com/document.pdf"
          @update:model-value="set('fileUrl', String($event))"
        />
        <div class="slb-vb-row">
          <SlbInput
            :model-value="params.fileSize ?? ''"
            label="File Size (bytes)"
            type="number"
            @update:model-value="set('fileSize', $event ? Number($event) : null)"
          />
          <SlbInput
            :model-value="params.fileName"
            label="File Name"
            placeholder="document.pdf"
            hint="Include extension"
            @update:model-value="set('fileName', String($event))"
          />
        </div>
      </template>

      <!-- Location -->
      <template v-if="isLocation">
        <div class="slb-vb-row">
          <SlbInput
            :model-value="params.latitude"
            label="Latitude"
            placeholder="37.7898"
            @update:model-value="set('latitude', String($event))"
          />
          <SlbInput
            :model-value="params.longitude"
            label="Longitude"
            placeholder="-122.3942"
            @update:model-value="set('longitude', String($event))"
          />
        </div>
      </template>

      <!-- Contact -->
      <template v-if="isContact">
        <div class="slb-vb-row">
          <SlbInput
            :model-value="params.contactName"
            label="Name"
            placeholder="John Doe"
            @update:model-value="set('contactName', String($event))"
          />
          <SlbInput
            :model-value="params.contactPhone"
            label="Phone Number"
            placeholder="+12025550164"
            @update:model-value="set('contactPhone', String($event))"
          />
        </div>
      </template>

      <!-- Sticker -->
      <template v-if="isSticker">
        <SlbInput
          :model-value="params.stickerId ?? ''"
          label="Sticker ID"
          placeholder="46105"
          type="number"
          @update:model-value="set('stickerId', $event ? Number($event) : null)"
        />
      </template>

      <!-- URL -->
      <template v-if="isUrl">
        <SlbInput
          :model-value="params.urlMedia"
          label="URL"
          placeholder="https://www.website.com"
          @update:model-value="set('urlMedia', String($event))"
        />
        <SlbInput
          :model-value="params.urlCaption"
          label="Caption (optional)"
          placeholder="Check this out"
          @update:model-value="set('urlCaption', String($event))"
        />
      </template>

      <!-- Rich Media -->
      <template v-if="isRichMedia">
        <div class="slb-vb-field">
          <label class="slb-vb-label">
            Rich Media JSON
            <span class="slb-vb-label__required">*</span>
          </label>
          <textarea
            :value="params.richMediaJson"
            class="slb-vb-textarea slb-vb-textarea--code"
            rows="10"
            @input="set('richMediaJson', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <SlbInput
          :model-value="params.richMediaAltText"
          label="Alt Text"
          placeholder="Fallback text for older clients"
          @update:model-value="set('richMediaAltText', String($event))"
        />
      </template>

      <!-- Tracking -->
      <SlbInput
        :model-value="params.trackingData"
        label="Tracking Data"
        placeholder="optional tracking ID"
        hint="Returned with user's reply for identification"
        @update:model-value="set('trackingData', String($event))"
      />

    </template>

    <!-- ── Forward / Delete ── -->
    <template v-if="isMsgOp">
      <SlbInput
        :model-value="params.fromChatId"
        label="From Chat ID"
        placeholder="Source chat ID"
        @update:model-value="set('fromChatId', String($event))"
      />
      <SlbInput
        :model-value="params.messageId"
        label="Message ID"
        placeholder="Message token / ID"
        @update:model-value="set('messageId', String($event))"
      />
    </template>

    <!-- ── Get History ── -->
    <template v-if="isGetHistory">
      <div class="slb-vb-row">
        <SlbInput
          :model-value="params.historyLimit"
          label="Limit"
          hint="Max messages to fetch"
          type="number"
          @update:model-value="set('historyLimit', Number($event))"
        />
        <SlbInput
          :model-value="params.historyBefore"
          label="Before"
          placeholder="ISO date or message ID"
          @update:model-value="set('historyBefore', String($event))"
        />
      </div>
    </template>

    <!-- ── Mark Read / Get Info — only chatId needed ── -->
    <template v-if="isMarkRead || isGetInfo">
      <div class="slb-vb-info">
        <i class="fas fa-info-circle"></i>
        {{ isMarkRead ? 'Marks all messages in the chat as read.' : 'Returns detailed information about the chat.' }}
      </div>
    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
