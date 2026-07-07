<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import {
  type MessengerActionParams,
  MESSENGER_OPERATION_OPTIONS,
  MESSENGER_MSG_TYPE_OPTIONS,
  MESSENGER_SENDER_ACTION_OPTIONS,
  MESSENGER_MESSAGING_TYPE_OPTIONS,
  MESSENGER_NOTIFICATION_TYPE_OPTIONS,
  MESSENGER_TAG_OPTIONS,
  MESSENGER_ATTACHMENT_SOURCE_OPTIONS,
  MESSENGER_MEDIA_TEMPLATE_TYPE_OPTIONS,
  MessengerOperation,
  MessengerMessageType,
  MessengerMessagingType,
  ATTACHMENT_MSG_TYPES,
} from '../index'

const props = defineProps<{ params: MessengerActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<MessengerActionParams>] }>()

function set<K extends keyof MessengerActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const op = computed(() => props.params.operation as MessengerOperation)
const mt = computed(() => props.params.messageType as MessengerMessageType)

const isSend          = computed(() => op.value === MessengerOperation.SEND)
const isSenderAction  = computed(() => op.value === MessengerOperation.SENDER_ACTION)

const isText         = computed(() => mt.value === MessengerMessageType.TEXT)
const isAttachment   = computed(() => ATTACHMENT_MSG_TYPES.includes(mt.value))
const isQuickReply   = computed(() => mt.value === MessengerMessageType.QUICK_REPLY)
const isGenericTpl   = computed(() => mt.value === MessengerMessageType.GENERIC_TEMPLATE)
const isButtonTpl    = computed(() => mt.value === MessengerMessageType.BUTTON_TEMPLATE)
const isMediaTpl     = computed(() => mt.value === MessengerMessageType.MEDIA_TEMPLATE)

const showUrl   = computed(() => props.params.attachmentSource === 'url')
const showAttId = computed(() => props.params.attachmentSource === 'id')
const showTag   = computed(() => props.params.messagingType === MessengerMessagingType.MESSAGE_TAG)
</script>

<template>
  <div class="slb-ms-section">

    <!-- Operation -->
    <SlbSelect
      :model-value="params.operation"
      :options="MESSENGER_OPERATION_OPTIONS"
      label="Operation"
      @update:model-value="set('operation', $event)"
    />

    <!-- Common: Page + Recipient -->
    <div class="slb-ms-row">
      <SlbInput
        :model-value="params.pageId"
        label="Page ID"
        placeholder="Your Facebook Page ID"
        hint="The Facebook Page acting as the sender"
        @update:model-value="set('pageId', String($event))"
      />
      <SlbInput
        v-if="!isSenderAction"
        :model-value="params.recipientId"
        label="Recipient PSID"
        placeholder="User's Page-scoped ID"
        hint="Recipient must have messaged your Page first"
        @update:model-value="set('recipientId', String($event))"
      />
    </div>

    <!-- ── SENDER ACTION ── -->
    <template v-if="isSenderAction">
      <SlbSelect
        :model-value="params.senderAction"
        :options="MESSENGER_SENDER_ACTION_OPTIONS"
        label="Action"
        @update:model-value="set('senderAction', $event)"
      />
      <SlbInput
        :model-value="params.recipientId"
        label="Recipient PSID"
        placeholder="User's Page-scoped ID"
        @update:model-value="set('recipientId', String($event))"
      />
    </template>

    <!-- ── SEND ── -->
    <template v-if="isSend">

      <!-- Message Type -->
      <SlbSelect
        :model-value="params.messageType"
        :options="MESSENGER_MSG_TYPE_OPTIONS"
        label="Message Type"
        @update:model-value="set('messageType', $event)"
      />

      <!-- TEXT -->
      <template v-if="isText">
        <div class="slb-ms-field">
          <label class="slb-ms-label">
            Text
            <span class="slb-ms-label__required">*</span>
          </label>
          <textarea
            :value="params.textBody"
            class="slb-ms-textarea"
            rows="5"
            placeholder="Enter message text... (max 2000 chars)"
            @input="set('textBody', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- ATTACHMENT -->
      <template v-if="isAttachment">
        <SlbSelect
          :model-value="params.attachmentSource"
          :options="MESSENGER_ATTACHMENT_SOURCE_OPTIONS"
          label="Attachment Source"
          @update:model-value="set('attachmentSource', $event)"
        />
        <SlbInput
          v-if="showUrl"
          :model-value="params.attachmentUrl"
          label="URL"
          placeholder="https://example.com/file.jpg"
          @update:model-value="set('attachmentUrl', String($event))"
        />
        <SlbInput
          v-if="showAttId"
          :model-value="params.attachmentId"
          label="Attachment ID"
          placeholder="Previously uploaded attachment ID"
          @update:model-value="set('attachmentId', String($event))"
        />
        <SlbCheckbox
          v-if="showUrl"
          :model-value="params.isReusable"
          label="Save as Reusable"
          description="Save the attachment to reuse it by ID in future messages"
          @update:model-value="set('isReusable', $event)"
        />
      </template>

      <!-- QUICK REPLIES -->
      <template v-if="isQuickReply">
        <div class="slb-ms-field">
          <label class="slb-ms-label">
            Message Text
            <span class="slb-ms-label__required">*</span>
          </label>
          <textarea
            :value="params.quickReplyText"
            class="slb-ms-textarea"
            rows="3"
            placeholder="Text above the quick reply buttons"
            @input="set('quickReplyText', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div class="slb-ms-field">
          <label class="slb-ms-label">Quick Replies JSON (max 13)</label>
          <textarea
            :value="params.quickRepliesJson"
            class="slb-ms-textarea slb-ms-textarea--code"
            rows="8"
            @input="set('quickRepliesJson', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- GENERIC TEMPLATE (Carousel) -->
      <template v-if="isGenericTpl">
        <div class="slb-ms-info">
          <i class="fas fa-th-large"></i>
          Generic Template shows a horizontally scrollable carousel of cards.
          Each element can have a title, subtitle, image and up to 3 buttons.
          Max 10 elements.
        </div>
        <div class="slb-ms-field">
          <label class="slb-ms-label">
            Elements JSON
            <span class="slb-ms-label__required">*</span>
          </label>
          <textarea
            :value="params.genericTemplateJson"
            class="slb-ms-textarea slb-ms-textarea--code"
            rows="14"
            @input="set('genericTemplateJson', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- BUTTON TEMPLATE -->
      <template v-if="isButtonTpl">
        <div class="slb-ms-info">
          <i class="fas fa-grip-horizontal"></i>
          Button Template shows a text message with up to 3 buttons below it.
          Supports <code>web_url</code>, <code>postback</code>, and <code>phone_number</code> types.
        </div>
        <div class="slb-ms-field">
          <label class="slb-ms-label">
            Text
            <span class="slb-ms-label__required">*</span>
          </label>
          <textarea
            :value="params.buttonTemplateText"
            class="slb-ms-textarea"
            rows="3"
            placeholder="Text above buttons (max 640 chars)"
            @input="set('buttonTemplateText', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div class="slb-ms-field">
          <label class="slb-ms-label">Buttons JSON (max 3)</label>
          <textarea
            :value="params.buttonTemplateJson"
            class="slb-ms-textarea slb-ms-textarea--code"
            rows="8"
            @input="set('buttonTemplateJson', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- MEDIA TEMPLATE -->
      <template v-if="isMediaTpl">
        <div class="slb-ms-info">
          <i class="fas fa-photo-video"></i>
          Media Template sends an image or video with an optional button.
          Supports one <code>web_url</code> or <code>postback</code> button.
        </div>
        <SlbSelect
          :model-value="params.mediaTemplateType"
          :options="MESSENGER_MEDIA_TEMPLATE_TYPE_OPTIONS"
          label="Media Type"
          @update:model-value="set('mediaTemplateType', $event)"
        />
        <SlbInput
          :model-value="params.mediaTemplateUrl"
          label="Media URL"
          placeholder="https://example.com/image.jpg"
          @update:model-value="set('mediaTemplateUrl', String($event))"
        />
        <div class="slb-ms-field">
          <label class="slb-ms-label">Buttons JSON (max 1)</label>
          <textarea
            :value="params.mediaTemplateButtons"
            class="slb-ms-textarea slb-ms-textarea--code"
            rows="5"
            @input="set('mediaTemplateButtons', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <!-- Reply to -->
      <SlbInput
        :model-value="params.replyToMessageId"
        label="Reply To Message ID"
        placeholder="m_... (optional)"
        hint="Quote-reply to a specific message"
        @update:model-value="set('replyToMessageId', String($event))"
      />

      <hr class="slb-ms-divider" />
      <div class="slb-ms-group-label">Delivery Settings</div>

      <SlbSelect
        :model-value="params.messagingType"
        :options="MESSENGER_MESSAGING_TYPE_OPTIONS"
        label="Messaging Type"
        @update:model-value="set('messagingType', $event)"
      />

      <div v-if="showTag" class="slb-ms-warn">
        <i class="fas fa-exclamation-triangle"></i>
        Message tags allow sending outside the 24-hour window for specific approved use cases only.
        Using tags for promotional content violates Messenger Platform policies.
      </div>

      <SlbSelect
        v-if="showTag"
        :model-value="params.tag"
        :options="MESSENGER_TAG_OPTIONS"
        label="Message Tag"
        @update:model-value="set('tag', $event)"
      />

      <SlbSelect
        :model-value="params.notificationType"
        :options="MESSENGER_NOTIFICATION_TYPE_OPTIONS"
        label="Notification Type"
        @update:model-value="set('notificationType', $event)"
      />

    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
