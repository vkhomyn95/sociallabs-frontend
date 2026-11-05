<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import { REPLY_BUTTON_LAYOUT, counterOf, overLimit } from './replyButtonKind'
import { WhatsAppLimit, type ReplyButton } from './whatsappInteractive.types'

/**
 * The message as WhatsApp shows it: the text in a bubble with its footer, and the reply buttons under it, one per line.
 * A button is picked for editing here; a title longer than WhatsApp shows is flagged with its length.
 */
const props = defineProps<{
  buttons: readonly ReplyButton[]
  body: string
  footer: string
  selected: number | null
  hasIssue: (index: number) => boolean
}>()

const emit = defineEmits<{ select: [index: number]; add: [] }>()

const canAdd = computed(() => REPLY_BUTTON_LAYOUT.canAdd(props.buttons))
</script>

<template>
  <div class="wf-wa-buttons">
    <div class="wf-wa-buttons__bubble">
      <p class="wf-wa-buttons__body">{{ body || 'Message text' }}</p>
      <p v-if="footer" class="wf-wa-buttons__footer">{{ footer }}</p>
    </div>
    <button
      v-for="(button, index) in buttons"
      :key="index"
      type="button"
      class="wf-wa-buttons__button"
      :class="{
        'is-selected': selected === index,
        'is-invalid': hasIssue(index) || overLimit(button.title, WhatsAppLimit.BUTTON_TITLE),
      }"
      @click="emit('select', index)"
    >
      <SlbIcon name="chat_reply" :size="12" />
      <span class="wf-wa-buttons__title">{{ button.title || 'Untitled' }}</span>
      <span v-if="overLimit(button.title, WhatsAppLimit.BUTTON_TITLE)" class="wf-wa-buttons__count">
        {{ counterOf(button.title, WhatsAppLimit.BUTTON_TITLE) }}
      </span>
    </button>
    <button v-if="canAdd" type="button" class="wf-wa-buttons__add" @click="emit('add')">
      <SlbIcon name="action_plus" :size="12" />
      {{ buttons.length ? 'Add button' : 'Add a button' }}
    </button>
    <p class="wf-wa-buttons__limit">{{ buttons.length }} of {{ WhatsAppLimit.REPLY_BUTTONS }} buttons</p>
  </div>
</template>

<style scoped lang="scss">
.wf-wa-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--slb-color-gray-50);
  border-radius: var(--slb-radius-md);

  &__bubble,
  &__button {
    background: var(--slb-color-surface);
    border-radius: var(--slb-radius-sm);
    box-shadow: 0 1px 1px rgb(0 0 0 / 0.06);
  }

  &__bubble {
    padding: 8px 10px;
  }

  &__body,
  &__footer {
    margin: 0;
    font-size: var(--slb-font-sm);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__footer {
    margin-top: 4px;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  &__button {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-sky);
    border: 1px solid transparent;
    cursor: pointer;

    &.is-selected {
      border-color: var(--slb-color-primary);
    }

    &.is-invalid {
      border-color: var(--slb-color-error);
    }
  }

  &__title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__count {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-error);
  }

  &__add {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
    background: none;
    border: 1px dashed var(--slb-color-border);
    border-radius: var(--slb-radius-sm);
    cursor: pointer;

    &:hover {
      color: var(--slb-color-primary);
      border-color: var(--slb-color-primary);
    }
  }

  &__limit {
    margin: 0;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
    text-align: right;
  }
}
</style>
