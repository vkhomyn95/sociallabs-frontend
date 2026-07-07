<script setup lang="ts">
import { SlbSelect } from '@/components/ui'
import {
  type TelegramClientActionParams,
  CLIENT_REPLY_MARKUP_OPTIONS,
  TelegramClientReplyMarkupType,
} from '../index'

const props = defineProps<{ params: TelegramClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramClientActionParams>] }>()

function set<K extends keyof TelegramClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const showButtons = [
  TelegramClientReplyMarkupType.INLINE,
  TelegramClientReplyMarkupType.KEYBOARD,
]
</script>

<template>
  <div class="slb-tg-section">

    <SlbSelect
      :model-value="params.replyMarkupType"
      :options="CLIENT_REPLY_MARKUP_OPTIONS"
      label="Keyboard Type"
      @update:model-value="set('replyMarkupType', $event)"
    />

    <template v-if="showButtons.includes(params.replyMarkupType as TelegramClientReplyMarkupType)">
      <div class="slb-tg-field">
        <label class="slb-tg-label">Buttons (JSON)</label>
        <textarea
          :value="params.buttons"
          class="slb-tg-textarea"
          rows="6"
          placeholder='[[{"text": "Button 1", "callback_data": "data1"}]]'
          @input="set('buttons', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div class="slb-tg-info">
        <i class="fas fa-info-circle"></i>
        Provide a 2D JSON array. Each inner array is a row of buttons.
        For inline keyboards use <code>callback_data</code> or <code>url</code>.
        For reply keyboards use only <code>text</code>.
      </div>
    </template>

    <div
      v-if="params.replyMarkupType === 'REMOVE' || params.replyMarkupType === 'FORCE_REPLY'"
      class="slb-tg-info"
    >
      <i class="fas fa-info-circle"></i>
      {{ params.replyMarkupType === 'REMOVE' ? 'Removes the custom reply keyboard from the chat.' : 'Forces the recipient to reply to the message.' }}
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>
