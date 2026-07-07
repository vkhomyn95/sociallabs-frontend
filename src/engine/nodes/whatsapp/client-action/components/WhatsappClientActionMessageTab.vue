<script setup lang="ts">
import { computed, watch } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type WAClientActionParams,
  WA_CLIENT_RESOURCE_OPTIONS,
  WA_CLIENT_MSG_OPERATION_OPTIONS,
  WA_CLIENT_MEDIA_OPERATION_OPTIONS,
  WA_CLIENT_PHONE_OPERATION_OPTIONS,
  WA_CLIENT_MSG_TYPE_OPTIONS,
  WA_CLIENT_MEDIA_SOURCE_OPTIONS,
  WA_CLIENT_INTERACTIVE_TYPE_OPTIONS,
  WA_CLIENT_RESPONSE_TYPE_OPTIONS,
  WAClientResource,
  WAClientOperation,
  WAClientMessageType,
  WAClientInteractiveType,
  WAClientMediaSource,
  WAClientResponseType,
  MEDIA_MSG_TYPES,
  CAPTION_MSG_TYPES,
  INTERACTIVE_TEMPLATES,
} from '../index'

const props = defineProps<{ params: WAClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<WAClientActionParams>] }>()

function set<K extends keyof WAClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

// Resource
const isMessage      = computed(() => props.params.resource === WAClientResource.MESSAGE)
const isMedia        = computed(() => props.params.resource === WAClientResource.MEDIA)
const isPhoneNumber  = computed(() => props.params.resource === WAClientResource.PHONE_NUMBER)

// Operation options per resource
const operationOptions = computed(() => {
  if (isMedia.value)       return WA_CLIENT_MEDIA_OPERATION_OPTIONS
  if (isPhoneNumber.value) return WA_CLIENT_PHONE_OPERATION_OPTIONS
  return WA_CLIENT_MSG_OPERATION_OPTIONS
})

// Message operations
const op = computed(() => props.params.operation as WAClientOperation)
const isSend        = computed(() => op.value === WAClientOperation.SEND)
const isSendTpl     = computed(() => op.value === WAClientOperation.SEND_TEMPLATE)
const isSendInt     = computed(() => op.value === WAClientOperation.SEND_INTERACTIVE)
const isSendWait    = computed(() => op.value === WAClientOperation.SEND_AND_WAIT)
const isMarkRead    = computed(() => op.value === WAClientOperation.MARK_AS_READ)
const isSendTyping  = computed(() => op.value === WAClientOperation.SEND_TYPING)
// Media operations
const isUpload      = computed(() => op.value === WAClientOperation.UPLOAD_MEDIA)
const isDownload    = computed(() => op.value === WAClientOperation.DOWNLOAD_MEDIA)
const isDeleteMedia = computed(() => op.value === WAClientOperation.DELETE_MEDIA)
const isGetInfo     = computed(() => op.value === WAClientOperation.GET_MEDIA_INFO)
// Phone operations
const isGetPhone    = computed(() => op.value === WAClientOperation.GET_PHONE_NUMBER_INFO)

// Message type helpers
const mt         = computed(() => props.params.messageType as WAClientMessageType)
const isText     = computed(() => mt.value === WAClientMessageType.TEXT)
const isMediaMsg = computed(() => MEDIA_MSG_TYPES.includes(mt.value))
const hasCaption = computed(() => CAPTION_MSG_TYPES.includes(mt.value))
const isLocation = computed(() => mt.value === WAClientMessageType.LOCATION)
const isReaction = computed(() => mt.value === WAClientMessageType.REACTION)
const isContacts = computed(() => mt.value === WAClientMessageType.CONTACTS)
const showUrl    = computed(() => props.params.mediaSource === WAClientMediaSource.URL)
const showId     = computed(() => props.params.mediaSource === WAClientMediaSource.ID)

const isApproval = computed(() => props.params.responseType === WAClientResponseType.APPROVAL)

// Auto-fill interactive JSON template when type changes
function onInteractiveTypeChange(val: WAClientInteractiveType) {
  set('interactiveType', val)
  set('interactiveJson', JSON.stringify(INTERACTIVE_TEMPLATES[val], null, 2))
}

// Needs common sender/recipient
const needsRecipient = computed(() =>
  isMessage.value &&
  !isMarkRead.value &&
  !isSendTyping.value
)
</script>

<template>
  <div class="slb-wa-section">

    <!-- Resource + Operation -->
    <div class="slb-wa-row">
      <SlbSelect
        :model-value="params.resource"
        :options="WA_CLIENT_RESOURCE_OPTIONS"
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

    <!-- ════════════════ MESSAGE ════════════════ -->
    <template v-if="isMessage">

      <!-- Phone Number ID — always needed for message ops -->
      <SlbInput
        :model-value="params.phoneNumberId"
        label="Sender Phone Number ID"
        placeholder="Phone number ID from Meta Business Manager"
        hint="The Phone Number ID (not the number itself) from your Meta App"
        @update:model-value="set('phoneNumberId', String($event))"
      />

      <!-- Recipient — needed for most ops -->
      <SlbInput
        v-if="needsRecipient"
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
          :options="WA_CLIENT_MSG_TYPE_OPTIONS"
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

        <!-- Media -->
        <template v-if="isMediaMsg">
          <SlbSelect
            :model-value="params.mediaSource"
            :options="WA_CLIENT_MEDIA_SOURCE_OPTIONS"
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
            placeholder="1013859600285441"
            hint="ID returned from a Media Upload operation"
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
            placeholder="report.pdf"
            hint="Display name for the document"
            @update:model-value="set('mediaFilename', String($event))"
          />
        </template>

        <!-- Location -->
        <template v-if="isLocation">
          <div class="slb-wa-row">
            <SlbInput
              :model-value="params.locationLat"
              label="Latitude"
              placeholder="37.4847"
              @update:model-value="set('locationLat', String($event))"
            />
            <SlbInput
              :model-value="params.locationLng"
              label="Longitude"
              placeholder="-122.1473"
              @update:model-value="set('locationLng', String($event))"
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
            :model-value="params.reactionMsgId"
            label="Message ID to React To"
            placeholder="wamid.HBgN..."
            @update:model-value="set('reactionMsgId', String($event))"
          />
          <SlbInput
            :model-value="params.reactionEmoji"
            label="Emoji"
            placeholder="👍"
            hint="A single emoji. Leave empty to remove the reaction."
            @update:model-value="set('reactionEmoji', String($event))"
          />
        </template>

        <!-- Contacts -->
        <template v-if="isContacts">
          <div class="slb-wa-info">
            <i class="fas fa-address-card"></i>
            Provide a JSON array of contact objects following the WhatsApp Contacts schema.
          </div>
          <div class="slb-wa-field">
            <label class="slb-wa-label">Contacts JSON <span class="slb-wa-label__required">*</span></label>
            <textarea
              :value="params.contactsJson"
              class="slb-wa-textarea slb-wa-textarea--code"
              rows="8"
              placeholder='[{"name":{"formatted_name":"John Doe","first_name":"John"},"phones":[{"phone":"+1234567890","type":"CELL"}]}]'
              @input="set('contactsJson', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <!-- Reply to -->
        <SlbInput
          :model-value="params.replyToMessageId"
          label="Reply To Message ID"
          placeholder="wamid.HBgN... (optional)"
          hint="Quote-reply a specific message"
          @update:model-value="set('replyToMessageId', String($event))"
        />
      </template>

      <!-- ── SEND TEMPLATE ── -->
      <template v-if="isSendTpl">
        <div class="slb-wa-info">
          <i class="fab fa-whatsapp"></i>
          Templates must be pre-approved in WhatsApp Business Manager and are required
          for business-initiated conversations outside the 24-hour window.
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
            hint="e.g. en_US, pt_BR, es_MX, uk_UA"
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

      <!-- ── SEND INTERACTIVE ── -->
      <template v-if="isSendInt">
        <div class="slb-wa-info">
          <i class="fas fa-th-large"></i>
          Interactive messages let users tap buttons or select items from a list.
          Choose a type to load a template, then customise the JSON.
        </div>

        <div class="slb-wa-group-label">Interactive Type</div>
        <div class="slb-wa-chip-row">
          <button
            v-for="opt in WA_CLIENT_INTERACTIVE_TYPE_OPTIONS"
            :key="opt.value as string"
            type="button"
            class="slb-wa-chip"
            :class="{ 'slb-wa-chip--active': params.interactiveType === opt.value }"
            @click="onInteractiveTypeChange(opt.value as WAClientInteractiveType)"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="slb-wa-field">
          <label class="slb-wa-label">
            Interactive JSON
            <span class="slb-wa-label__required">*</span>
          </label>
          <textarea
            :value="params.interactiveJson"
            class="slb-wa-textarea slb-wa-textarea--code"
            rows="14"
            @input="set('interactiveJson', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <SlbInput
          :model-value="params.replyToMessageId"
          label="Reply To Message ID"
          placeholder="wamid.HBgN... (optional)"
          @update:model-value="set('replyToMessageId', String($event))"
        />
      </template>

      <!-- ── SEND AND WAIT ── -->
      <template v-if="isSendWait">
        <div class="slb-wa-info">
          <i class="fas fa-pause-circle"></i>
          The workflow pauses after sending and resumes when the recipient responds.
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
          :options="WA_CLIENT_RESPONSE_TYPE_OPTIONS"
          label="Response Type"
          @update:model-value="set('responseType', $event)"
        />
        <template v-if="isApproval">
          <div class="slb-wa-row">
            <SlbInput
              :model-value="params.approveLabel"
              label="Approve Label"
              placeholder="Approve"
              @update:model-value="set('approveLabel', String($event))"
            />
            <SlbInput
              :model-value="params.dismissLabel"
              label="Dismiss Label"
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

      <!-- ── MARK AS READ ── -->
      <template v-if="isMarkRead">
        <div class="slb-wa-info">
          <i class="fas fa-check-double"></i>
          Sends a read receipt for the specified message, showing two blue checkmarks.
        </div>
        <SlbInput
          :model-value="params.markReadMessageId"
          label="Message ID"
          placeholder="wamid.HBgN..."
          hint="ID of the message to mark as read"
          @update:model-value="set('markReadMessageId', String($event))"
        />
      </template>

      <!-- ── SEND TYPING ── -->
      <template v-if="isSendTyping">
        <div class="slb-wa-info">
          <i class="fas fa-ellipsis-h"></i>
          Displays a typing indicator in the chat. Must also send a read receipt for
          the incoming message first (WhatsApp requirement).
        </div>
        <SlbInput
          :model-value="params.recipientPhone"
          label="Recipient's Phone Number"
          placeholder="+14155552671"
          @update:model-value="set('recipientPhone', String($event))"
        />
        <SlbInput
          :model-value="params.markReadMessageId"
          label="Message ID to Acknowledge"
          placeholder="wamid.HBgN..."
          hint="The incoming message ID that triggered typing"
          @update:model-value="set('markReadMessageId', String($event))"
        />
      </template>

    </template>

    <!-- ════════════════ MEDIA ════════════════ -->
    <template v-if="isMedia">

      <!-- Upload -->
      <template v-if="isUpload">
        <div class="slb-wa-info">
          <i class="fas fa-cloud-upload-alt"></i>
          Upload a file to WhatsApp servers to get a reusable Media ID.
          Uploaded media is stored for 30 days.
        </div>
        <SlbInput
          :model-value="params.phoneNumberId"
          label="Phone Number ID"
          placeholder="Phone number ID from Meta Business Manager"
          @update:model-value="set('phoneNumberId', String($event))"
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
          Download a media file by its ID. The file will be available as binary data.
        </div>
        <SlbInput
          :model-value="params.mediaIdTarget"
          label="Media ID"
          placeholder="1013859600285441"
          hint="Media ID from an incoming webhook or Upload operation"
          @update:model-value="set('mediaIdTarget', String($event))"
        />
      </template>

      <!-- Delete -->
      <template v-if="isDeleteMedia">
        <div class="slb-wa-warn">
          <i class="fas fa-exclamation-triangle"></i>
          This permanently removes the media from WhatsApp servers.
        </div>
        <SlbInput
          :model-value="params.mediaIdTarget"
          label="Media ID"
          placeholder="1013859600285441"
          @update:model-value="set('mediaIdTarget', String($event))"
        />
      </template>

      <!-- Get Info -->
      <template v-if="isGetInfo">
        <div class="slb-wa-info">
          <i class="fas fa-info-circle"></i>
          Returns metadata about the media (type, size, URL) without downloading it.
        </div>
        <SlbInput
          :model-value="params.mediaIdTarget"
          label="Media ID"
          placeholder="1013859600285441"
          @update:model-value="set('mediaIdTarget', String($event))"
        />
      </template>

    </template>

    <!-- ════════════════ PHONE NUMBER ════════════════ -->
    <template v-if="isPhoneNumber">
      <div class="slb-wa-info">
        <i class="fas fa-phone"></i>
        Returns information about a business phone number including its name, quality rating,
        messaging limits, and verification status.
      </div>
      <SlbInput
        :model-value="params.phoneNumberId"
        label="Phone Number ID"
        placeholder="Phone number ID from Meta Business Manager"
        @update:model-value="set('phoneNumberId', String($event))"
      />
    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
