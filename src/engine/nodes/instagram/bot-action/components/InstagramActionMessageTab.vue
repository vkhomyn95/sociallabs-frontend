<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect } from '@/components/ui'
import {
  type InstagramActionParams,
  IG_RESOURCE_OPTIONS,
  IG_MESSAGE_OPERATION_OPTIONS,
  IG_COMMENT_OPERATION_OPTIONS,
  IG_MESSAGE_TYPE_OPTIONS,
  IG_STICKER_OPTIONS,
  InstagramResource,
  InstagramMessageOperation,
  InstagramCommentOperation,
  InstagramMessageType,
  ATTACHMENT_TYPES,
} from '../index'

const props = defineProps<{ params: InstagramActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<InstagramActionParams>] }>()

function set<K extends keyof InstagramActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const isMessage = computed(() => props.params.resource === InstagramResource.MESSAGE)
const isComment = computed(() => props.params.resource === InstagramResource.COMMENT)

const msgOp = computed(() => props.params.messageOperation as InstagramMessageOperation)
const comOp = computed(() => props.params.commentOperation as InstagramCommentOperation)

const isSend       = computed(() => msgOp.value === InstagramMessageOperation.SEND)
const isMarkRead   = computed(() => msgOp.value === InstagramMessageOperation.MARK_AS_READ)

const mt = computed(() => props.params.messageType as InstagramMessageType)
const isText        = computed(() => mt.value === InstagramMessageType.TEXT)
const isAttachment  = computed(() => ATTACHMENT_TYPES.includes(mt.value))
const isSticker     = computed(() => mt.value === InstagramMessageType.STICKER)
const isQuickReply  = computed(() => mt.value === InstagramMessageType.QUICK_REPLY)
const isGenericTpl  = computed(() => mt.value === InstagramMessageType.GENERIC_TEMPLATE)

const operationOptions = computed(() =>
  isMessage.value ? IG_MESSAGE_OPERATION_OPTIONS : IG_COMMENT_OPERATION_OPTIONS
)
</script>

<template>
  <div class="slb-ig-section">

    <!-- Resource -->
    <div class="slb-ig-row">
      <SlbSelect
        :model-value="params.resource"
        :options="IG_RESOURCE_OPTIONS"
        label="Resource"
        @update:model-value="set('resource', $event)"
      />
      <SlbSelect
        :model-value="isMessage ? params.messageOperation : params.commentOperation"
        :options="operationOptions"
        label="Operation"
        @update:model-value="isMessage
          ? set('messageOperation', $event)
          : set('commentOperation', $event)"
      />
    </div>

    <!-- IG User ID — always -->
    <SlbInput
      :model-value="params.igUserId"
      label="Instagram Business Account ID"
      placeholder="Your IG Business Account ID"
      hint="From GET /me/accounts → instagram_business_account"
      @update:model-value="set('igUserId', String($event))"
    />

    <!-- ════════ MESSAGE ════════ -->
    <template v-if="isMessage">

      <SlbInput
        :model-value="params.recipientId"
        label="Recipient IGSID"
        placeholder="User's Instagram-scoped ID"
        hint="User must have sent your account a message first"
        @update:model-value="set('recipientId', String($event))"
      />

      <!-- SEND -->
      <template v-if="isSend">
        <SlbSelect
          :model-value="params.messageType"
          :options="IG_MESSAGE_TYPE_OPTIONS"
          label="Message Type"
          @update:model-value="set('messageType', $event)"
        />

        <!-- Text -->
        <template v-if="isText">
          <div class="slb-ig-field">
            <label class="slb-ig-label">
              Text <span class="slb-ig-label__required">*</span>
            </label>
            <textarea
              :value="params.textBody"
              class="slb-ig-textarea"
              rows="5"
              placeholder="Enter message text..."
              @input="set('textBody', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <!-- Attachment -->
        <template v-if="isAttachment">
          <SlbInput
            :model-value="params.attachmentUrl"
            label="Media URL"
            placeholder="https://example.com/file.jpg"
            @update:model-value="set('attachmentUrl', String($event))"
          />
        </template>

        <!-- Sticker -->
        <template v-if="isSticker">
          <SlbSelect
            :model-value="params.stickerId"
            :options="IG_STICKER_OPTIONS"
            label="Sticker"
            @update:model-value="set('stickerId', $event)"
          />
        </template>

        <!-- Quick Replies -->
        <template v-if="isQuickReply">
          <div class="slb-ig-field">
            <label class="slb-ig-label">
              Message Text <span class="slb-ig-label__required">*</span>
            </label>
            <textarea
              :value="params.quickReplyText"
              class="slb-ig-textarea"
              rows="3"
              placeholder="Text above the quick reply buttons"
              @input="set('quickReplyText', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <div class="slb-ig-field">
            <label class="slb-ig-label">Quick Replies JSON (max 13)</label>
            <textarea
              :value="params.quickRepliesJson"
              class="slb-ig-textarea slb-ig-textarea--code"
              rows="8"
              @input="set('quickRepliesJson', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <!-- Generic Template -->
        <template v-if="isGenericTpl">
          <div class="slb-ig-info">
            <i class="fas fa-th-large"></i>
            Generic Template creates a carousel of cards. Max 10 elements,
            each with title, subtitle, image and up to 3 buttons.
          </div>
          <div class="slb-ig-field">
            <label class="slb-ig-label">
              Elements JSON <span class="slb-ig-label__required">*</span>
            </label>
            <textarea
              :value="params.genericTemplateJson"
              class="slb-ig-textarea slb-ig-textarea--code"
              rows="12"
              @input="set('genericTemplateJson', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <SlbInput
          :model-value="params.replyToMessageId"
          label="Reply To Message ID"
          placeholder="aWdpZ... (optional)"
          @update:model-value="set('replyToMessageId', String($event))"
        />
      </template>

      <!-- MARK AS READ -->
      <template v-if="isMarkRead">
        <div class="slb-ig-info">
          <i class="fas fa-check-double"></i>
          Marks the specified message as read, showing a read receipt to the sender.
        </div>
        <SlbInput
          :model-value="params.markReadMessageId"
          label="Message ID"
          placeholder="aWdpZ..."
          @update:model-value="set('markReadMessageId', String($event))"
        />
      </template>

    </template>

    <!-- ════════ COMMENT ════════ -->
    <template v-if="isComment">

      <SlbInput
        :model-value="params.commentId"
        label="Comment ID"
        placeholder="17858893269000001"
        hint="The ID of the comment to moderate"
        @update:model-value="set('commentId', String($event))"
      />

      <template v-if="comOp === 'REPLY'">
        <div class="slb-ig-field">
          <label class="slb-ig-label">
            Reply Text <span class="slb-ig-label__required">*</span>
          </label>
          <textarea
            :value="params.replyText"
            class="slb-ig-textarea"
            rows="4"
            placeholder="Your reply to the comment..."
            @input="set('replyText', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>

      <template v-if="comOp === 'HIDE' || comOp === 'UNHIDE'">
        <div class="slb-ig-info">
          <i class="fas fa-eye-slash"></i>
          {{ comOp === 'HIDE' ? 'Hides the comment from public view (comment author can still see it).' : 'Makes the previously hidden comment visible again.' }}
        </div>
      </template>

      <template v-if="comOp === 'DELETE'">
        <div class="slb-ig-warn">
          <i class="fas fa-exclamation-triangle"></i>
          This permanently deletes the comment. This action cannot be undone.
        </div>
      </template>

    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
