<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import { formatMoment } from '../bot-common/botPanel'
import { BotDelivery, type BotWebhook } from './telegramBot.types'

/**
 * The webhook as Telegram reports it: its address, updates waiting there and the last failed delivery. A webhook on a
 * polled bot is called out, since polling removes it.
 */
const props = defineProps<{
  delivery: BotDelivery
  webhook: BotWebhook | null
  /** Why Telegram could not be asked. */
  error: string | null
}>()

const isSet = computed(() => !!props.webhook?.url)
const strayWebhook = computed(() => props.delivery === BotDelivery.POLLING && isSet.value)
</script>

<template>
  <div class="slb-bot-webhook">
    <SlbAlert v-if="error" variant="warning" title="Telegram did not answer">{{ error }}</SlbAlert>

    <template v-else-if="webhook">
      <div class="slb-bot-webhook__row">
        <span class="slb-bot-webhook__label">Webhook</span>
        <CopyableUrl v-if="isSet" :url="webhook.url" name="Webhook address" />
        <span v-else class="slb-bot-webhook__none">Not set</span>
      </div>
      <div class="slb-bot-webhook__row">
        <span class="slb-bot-webhook__label">Waiting in Telegram</span>
        <span>{{ webhook.pendingUpdates.toLocaleString() }}</span>
      </div>

      <SlbAlert v-if="strayWebhook" variant="info">
        A webhook is set for this bot, though it is polled; it is removed when a trigger starts polling.
      </SlbAlert>
      <SlbAlert v-if="webhook.lastErrorMessage" variant="error" title="Last delivery failed">
        {{ webhook.lastErrorMessage }} · {{ formatMoment(webhook.lastErrorAt) }}
      </SlbAlert>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slb-bot-webhook {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);

  &__row {
    display: flex;
    gap: var(--slb-space-sm);
    align-items: center;
    min-height: 28px;
    font-size: var(--slb-font-sm);
  }

  &__label {
    flex: 0 0 150px;
    color: var(--slb-color-text-muted);
  }

  &__none {
    color: var(--slb-color-text-muted);
  }
}
</style>
