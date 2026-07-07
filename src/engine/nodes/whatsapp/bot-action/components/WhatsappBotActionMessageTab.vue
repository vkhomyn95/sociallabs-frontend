<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type WhatsAppActionParams,
  WA_RESOURCE_OPTIONS,
  WA_MESSAGE_OPERATION_OPTIONS,
  WA_MEDIA_OPERATION_OPTIONS,
  WA_MESSAGE_TYPE_OPTIONS,
  WA_MEDIA_SOURCE_OPTIONS,
  WA_RESPONSE_TYPE_OPTIONS,
  WhatsAppResource,
  WhatsAppOperation,
  WhatsAppMessageType,
  WhatsAppResponseType,
  MEDIA_MESSAGE_TYPES,
  CAPTION_MESSAGE_TYPES,
} from '../index'

const props = defineProps<{ params: WhatsAppActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WhatsAppActionParams>] }>()

function set<K extends keyof WhatsAppActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const isMessageResource = computed(() => props.params.resource === WhatsAppResource.MESSAGE)
const isMediaResource   = computed(() => props.params.resource === WhatsAppResource.MEDIA)

const isSend         = computed(() => props.params.operation === WhatsAppOperation.SEND)
const isSendTemplate = computed(() => props.params.operation === WhatsAppOperation.SEND_TEMPLATE)
const isSendAndWait  = computed(() => props.params.operation === WhatsAppOperation.SEND_AND_WAIT)
const isUpload       = computed(() => props.params.operation === WhatsAppOperation.UPLOAD_MEDIA)
const isDownload     = computed(() => props.params.operation === WhatsAppOperation.DOWNLOAD_MEDIA)
const isDelete       = computed(() => props.params.operation === WhatsAppOperation.DELETE_MEDIA)

// Message type helpers
const mt = computed(() => props.params.messageType as WhatsAppMessageType)
const isText     = computed(() => mt.value === WhatsAppMessageType.TEXT)
const isMedia    = computed(() => MEDIA_MESSAGE_TYPES.includes(mt.value))
const hasCaption = computed(() => CAPTION_MESSAGE_TYPES.includes(mt.value))
const isLocation = computed(() => mt.value === WhatsAppMessageType.LOCATION)
const isReaction = computed(() => mt.value === WhatsAppMessageType.REACTION)
const showUrl    = computed(() => props.params.mediaSource === 'url')
const showId     = computed(() => props.params.mediaSource === 'id')

const operationOptions = computed(() =>
  isMessageResource.value ? WA_MESSAGE_OPERATION_OPTIONS : WA_MEDIA_OPERATION_OPTIONS
)

const isApproval = computed(() => props.params.responseType === WhatsAppResponseType.APPROVAL)
</script>

<template>
  <div class="slb-wa-section">

    <!-- Resource + Operation -->
    <div class="slb-wa-row">
      <SlbSelect
        :model-value="params.resource"
        :options="WA_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="params.operation"
        :options="operationOptions"
        label="Operation"
        @update:model-value="set('operation', $event)"
      />
    </div>

    <!-- ════════════════ MESSAGE RESOURCE ════════════════ -->
    <template v-if="isMessageResource">

      <!-- Sender + Recipient (shared) -->
      <SlbInput
        :model-value="params.senderPhoneNumberId"
        label="Sender Phone Number ID"
        placeholder="Phone number ID from Meta Business Manager"
        hint="The Phone Number ID (not phone number) from your Meta App"
        @update:model-value="set('senderPhoneNumberId', String($event))"
      />
      <SlbInput
        :model-value="params.recipientPhone"
        label="Recipient's Phone Number"
        placeholder="+14155552671"
        hint="Include country code, e.g. +1 for USA"
        @update:model-value="set('recipientPhone', String($event))"
      />

      <!-- ── SEND ── -->
      <template v-if="isSend">

        <SlbSelect
          :model-value="params.messageType"
          :options="WA_MESSAGE_TYPE_OPTIONS"
          label="Message Type"
          @update:model-value="set('messageType', $event)"
        />

        <!-- Text -->
        <template v-if="isText">
          <div class="slb-wa-field">
            <label class="slb-wa-label">
              Text Body
              <span class="slb-wa-label__required">*</span>
            </label>
            <textarea
              :value="params.textBody"
              class="slb-wa-textarea"
              rows="5"
              placeholder="Enter your message... Supports {{$json.text}} expressions"
              @input="set('textBody', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <SlbCheckbox
            :model-value="params.previewUrl"
            label="Preview URL"
            description="Show a link preview if the message contains a URL"
            @update:model-value="set('previewUrl', $event)"
          />
        </template>

        <!-- Media types -->
        <template v-if="isMedia">
          <SlbSelect
            :model-value="params.mediaSource"
            :options="WA_MEDIA_SOURCE_OPTIONS"
            label="Media Source"
            @update:model-value="set('mediaSource', $event)"
          />
          <SlbInput
            v-if="showUrl"
            :model-value="params.mediaUrl"
            label="Media URL"
            placeholder="https://example.com/file.jpg"
            @update:model-value="set('mediaUrl', String($event))"
          />
          <SlbInput
            v-if="showId"
            :model-value="params.mediaId"
            label="Media ID"
            placeholder="WhatsApp Media ID from Upload operation"
            @update:model-value="set('mediaId', String($event))"
          />
          <SlbInput
            v-if="hasCaption"
            :model-value="params.mediaCaption"
            label="Caption"
            placeholder="Optional caption text"
            @update:model-value="set('mediaCaption', String($event))"
          />
          <SlbInput
            v-if="mt === 'document'"
            :model-value="params.mediaFilename"
            label="Filename"
            placeholder="document.pdf"
            hint="Display name for the file"
            @update:model-value="set('mediaFilename', String($event))"
          />
        </template>

        <!-- Location -->
        <template v-if="isLocation">
          <div class="slb-wa-row">
            <SlbInput
              :model-value="params.locationLatitude"
              label="Latitude"
              placeholder="37.4847483695049"
              @update:model-value="set('locationLatitude', String($event))"
            />
            <SlbInput
              :model-value="params.locationLongitude"
              label="Longitude"
              placeholder="-122.1473373086664"
              @update:model-value="set('locationLongitude', String($event))"
            />
          </div>
          <SlbInput
            :model-value="params.locationName"
            label="Location Name"
            placeholder="WhatsApp HQ"
            @update:model-value="set('locationName', String($event))"
          />
          <SlbInput
            :model-value="params.locationAddress"
            label="Address"
            placeholder="1 Hacker Way, Menlo Park, CA 94025"
            @update:model-value="set('locationAddress', String($event))"
          />
        </template>

        <!-- Reaction -->
        <template v-if="isReaction">
          <SlbInput
            :model-value="params.reactionMessageId"
            label="Message ID to React To"
            placeholder="wamid.HBgN..."
            @update:model-value="set('reactionMessageId', String($event))"
          />
          <SlbInput
            :model-value="params.reactionEmoji"
            label="Emoji"
            placeholder="👍"
            hint="A single emoji character. Leave empty to remove a reaction."
            @update:model-value="set('reactionEmoji', String($event))"
          />
        </template>

        <!-- Reply to -->
        <SlbInput
          :model-value="params.replyToMessageId"
          label="Reply To Message ID"
          placeholder="wamid.HBgN... (optional)"
          hint="Quote-reply to a specific message"
          @update:model-value="set('replyToMessageId', String($event))"
        />

      </template>

      <!-- ── SEND TEMPLATE ── -->
      <template v-if="isSendTemplate">

        <div class="slb-wa-info">
          <i class="fab fa-whatsapp"></i>
          Templates must be pre-approved in WhatsApp Business Manager.
          They are required for business-initiated conversations.
        </div>

        <div class="slb-wa-row">
          <SlbInput
            :model-value="params.templateName"
            label="Template Name"
            placeholder="hello_world"
            @update:model-value="set('templateName', String($event))"
          />
          <SlbInput
            :model-value="params.templateLanguage"
            label="Language Code"
            placeholder="en_US"
            hint="e.g. en_US, pt_BR, es_MX"
            @update:model-value="set('templateLanguage', String($event))"
          />
        </div>

        <div class="slb-wa-field">
          <label class="slb-wa-label">Components (JSON)</label>
          <textarea
            :value="params.templateComponents"
            class="slb-wa-textarea slb-wa-textarea--code"
            rows="8"
            placeholder='[{"type":"body","parameters":[{"type":"text","text":"John"}]}]'
            @input="set('templateComponents', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

      </template>

      <!-- ── SEND AND WAIT ── -->
      <template v-if="isSendAndWait">

        <div class="slb-wa-info">
          <i class="fas fa-pause-circle"></i>
          The workflow will pause after sending and resume when the recipient responds.
        </div>

        <div class="slb-wa-field">
          <label class="slb-wa-label">
            Message
            <span class="slb-wa-label__required">*</span>
          </label>
          <textarea
            :value="params.waitMessage"
            class="slb-wa-textarea"
            rows="4"
            placeholder="Enter the message to send..."
            @input="set('waitMessage', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <SlbSelect
          :model-value="params.responseType"
          :options="WA_RESPONSE_TYPE_OPTIONS"
          label="Response Type"
          @update:model-value="set('responseType', $event)"
        />

        <template v-if="isApproval">
          <div class="slb-wa-row">
            <SlbInput
              :model-value="params.approveLabel"
              label="Approve Button Label"
              placeholder="Approve"
              @update:model-value="set('approveLabel', String($event))"
            />
            <SlbInput
              :model-value="params.dismissLabel"
              label="Dismiss Button Label"
              placeholder="Dismiss"
              @update:model-value="set('dismissLabel', String($event))"
            />
          </div>
        </template>

        <SlbInput
          :model-value="params.waitTimeout ?? ''"
          label="Timeout (minutes)"
          hint="Leave empty to wait indefinitely"
          type="number"
          @update:model-value="set('waitTimeout', $event ? Number($event) : null)"
        />

      </template>

    </template>

    <!-- ════════════════ MEDIA RESOURCE ════════════════ -->
    <template v-if="isMediaResource">

      <!-- Upload -->
      <template v-if="isUpload">
        <div class="slb-wa-info">
          <i class="fas fa-cloud-upload-alt"></i>
          Upload a media file to WhatsApp servers to get a Media ID for use in messages.
        </div>
        <SlbInput
          :model-value="params.senderPhoneNumberId"
          label="Sender Phone Number ID"
          placeholder="Phone number ID from Meta Business Manager"
          @update:model-value="set('senderPhoneNumberId', String($event))"
        />
        <SlbInput
          :model-value="params.uploadPropertyName"
          label="Property Name"
          placeholder="data"
          hint="Name of the binary data property containing the file"
          @update:model-value="set('uploadPropertyName', String($event))"
        />
      </template>

      <!-- Download -->
      <template v-if="isDownload">
        <div class="slb-wa-info">
          <i class="fas fa-cloud-download-alt"></i>
          Download a media file using its WhatsApp Media ID.
          The file will be available as binary data in the workflow.
        </div>
        <SlbInput
          :model-value="params.mediaIdTarget"
          label="Media ID"
          placeholder="1013859600285441"
          hint="Media ID from an incoming message or Upload operation"
          @update:model-value="set('mediaIdTarget', String($event))"
        />
      </template>

      <!-- Delete -->
      <template v-if="isDelete">
        <div class="slb-wa-warn">
          <i class="fas fa-exclamation-triangle"></i>
          Deleting media is permanent. The file will be removed from WhatsApp servers.
        </div>
        <SlbInput
          :model-value="params.mediaIdTarget"
          label="Media ID"
          placeholder="1013859600285441"
          hint="ID of the media file to delete"
          @update:model-value="set('mediaIdTarget', String($event))"
        />
      </template>

    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
