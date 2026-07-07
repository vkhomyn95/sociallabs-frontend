<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type ViberBotActionParams,
  VIBER_BOT_RESOURCE_OPTIONS,
  VIBER_BOT_OPERATION_OPTIONS,
  ViberBotResource,
  ViberBotOperation,
} from '../index'

const props = defineProps<{ params: ViberBotActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberBotActionParams>] }>()

function set<K extends keyof ViberBotActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const r  = computed(() => props.params.resource as ViberBotResource)
const op = computed(() => props.params.operation as ViberBotOperation)

const isText      = computed(() => r.value === ViberBotResource.TEXT)
const isPicture   = computed(() => r.value === ViberBotResource.PICTURE)
const isVideo     = computed(() => r.value === ViberBotResource.VIDEO)
const isFile      = computed(() => r.value === ViberBotResource.FILE)
const isLocation  = computed(() => r.value === ViberBotResource.LOCATION)
const isContact   = computed(() => r.value === ViberBotResource.CONTACT)
const isSticker   = computed(() => r.value === ViberBotResource.STICKER)
const isUrl       = computed(() => r.value === ViberBotResource.URL)
const isRichMedia = computed(() => r.value === ViberBotResource.RICH_MEDIA)
const isBroadcast = computed(() => op.value === ViberBotOperation.BROADCAST)
</script>

<template>
  <div class="slb-vb-section">

    <!-- Resource + Operation -->
    <div class="slb-vb-row">
      <SlbSelect
        :model-value="params.resource"
        :options="VIBER_BOT_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="params.operation"
        :options="VIBER_BOT_OPERATION_OPTIONS"
        label="Operation"
        @update:model-value="set('operation', $event)"
      />
    </div>

    <!-- Receiver -->
    <SlbInput
      :model-value="params.receiver"
      :label="isBroadcast ? 'Receiver IDs' : 'Receiver ID'"
      :placeholder="isBroadcast ? 'id1, id2, id3 (up to 300)' : '01234567890A='"
      :hint="isBroadcast
        ? 'Comma-separated list of subscriber IDs (max 300)'
        : 'Unique Viber user ID from subscription callback'"
      @update:model-value="set('receiver', String($event))"
    />

    <div v-if="isBroadcast" class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      Broadcast sends the same message to multiple subscribers. Users must have subscribed to your bot first.
    </div>

    <!-- Sender -->
    <div class="slb-vb-group-label">Sender</div>
    <div class="slb-vb-row">
      <SlbInput
        :model-value="params.senderName"
        label="Sender Name"
        placeholder="MyBot"
        hint="Max 28 characters"
        @update:model-value="set('senderName', String($event))"
      />
      <SlbInput
        :model-value="params.senderAvatar"
        label="Sender Avatar URL"
        placeholder="https://example.com/avatar.jpg"
        @update:model-value="set('senderAvatar', String($event))"
      />
    </div>

    <hr class="slb-vb-divider" />

    <!-- ── Text ── -->
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
          placeholder="Enter your message... Supports {{$json.text}} expressions"
          @input="set('text', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </template>

    <!-- ── Picture ── -->
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
        hint="Max 100 KB"
        @update:model-value="set('pictureThumbnail', String($event))"
      />
      <div class="slb-vb-field">
        <label class="slb-vb-label">Caption</label>
        <textarea
          :value="params.pictureCaption"
          class="slb-vb-textarea"
          rows="2"
          placeholder="Photo description (optional)"
          @input="set('pictureCaption', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </template>

    <!-- ── Video ── -->
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
          placeholder="4000000"
          hint="Required by Viber API"
          type="number"
          @update:model-value="set('videoSize', $event ? Number($event) : null)"
        />
        <SlbInput
          :model-value="params.videoDuration ?? ''"
          label="Duration (s)"
          placeholder="30"
          type="number"
          @update:model-value="set('videoDuration', $event ? Number($event) : null)"
        />
      </div>
    </template>

    <!-- ── File ── -->
    <template v-if="isFile">
      <SlbInput
        :model-value="params.fileUrl"
        label="File URL"
        placeholder="https://example.com/document.pdf"
        hint="Max 50 MB"
        @update:model-value="set('fileUrl', String($event))"
      />
      <div class="slb-vb-row">
        <SlbInput
          :model-value="params.fileSize ?? ''"
          label="File Size (bytes)"
          placeholder="102400"
          hint="Required by Viber API"
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

    <!-- ── Location ── -->
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

    <!-- ── Contact ── -->
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

    <!-- ── Sticker ── -->
    <template v-if="isSticker">
      <SlbInput
        :model-value="params.stickerId ?? ''"
        label="Sticker ID"
        placeholder="46105"
        hint="Find sticker IDs in Viber Sticker Market"
        type="number"
        @update:model-value="set('stickerId', $event ? Number($event) : null)"
      />
    </template>

    <!-- ── URL ── -->
    <template v-if="isUrl">
      <SlbInput
        :model-value="params.urlMedia"
        label="URL"
        placeholder="https://www.website.com/go_here"
        hint="Max 2000 characters"
        @update:model-value="set('urlMedia', String($event))"
      />
      <SlbInput
        :model-value="params.urlCaption"
        label="Caption (optional)"
        placeholder="Optional text description"
        @update:model-value="set('urlCaption', String($event))"
      />
    </template>

    <!-- ── Rich Media ── -->
    <template v-if="isRichMedia">
      <div class="slb-vb-info">
        <i class="fas fa-info-circle"></i>
        Rich Media (Carousel) allows sending pre-defined layouts with images, text and buttons.
        Requires Viber API version 7+.
      </div>
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

    <!-- Tracking data -->
    <SlbInput
      :model-value="params.trackingData"
      label="Tracking Data"
      placeholder="custom-tracking-id (optional)"
      hint="Sent back with user's reply for identification"
      @update:model-value="set('trackingData', String($event))"
    />

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
