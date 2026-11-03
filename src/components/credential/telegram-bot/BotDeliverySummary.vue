<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { BOT_STATUS_UI, DELIVERY_UI, formatMoment } from './telegramBot.ui'
import type { TelegramBotStatus } from './telegramBot.types'

/** Whether the bot receives updates now, how, and since when. */
const props = defineProps<{ status: TelegramBotStatus }>()

const ui = computed(() => BOT_STATUS_UI[props.status.status])
const delivery = computed(() => DELIVERY_UI[props.status.delivery])
const message = computed(() => props.status.statusMessage || ui.value.hint)
</script>

<template>
  <div class="slb-bot-summary">
    <div class="slb-bot-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span class="slb-bot-summary__delivery">
        <SlbIcon :name="delivery.icon" :size="14" />
        {{ delivery.label }}
      </span>
      <span class="slb-bot-summary__chats">{{ status.knownChats }} known chats</span>
    </div>
    <p class="slb-bot-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-bot-summary__since">Since {{ formatMoment(status.statusChangedAt) }}</p>
  </div>
</template>

<style scoped lang="scss">
.slb-bot-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__delivery,
  &__chats {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }

  &__chats {
    margin-left: auto;
  }

  &__message,
  &__since {
    margin: 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text);
  }

  &__since {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }
}
</style>
