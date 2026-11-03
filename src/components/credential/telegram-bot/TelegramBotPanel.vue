<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert, SlbButton } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCapabilities from './BotCapabilities.vue'
import BotCountersGrid from './BotCountersGrid.vue'
import BotDeliverySummary from './BotDeliverySummary.vue'
import BotWebhookInfo from './BotWebhookInfo.vue'
import { botFactsOf } from './telegramBotFacts'
import { useTelegramBotStatus } from './useTelegramBotStatus'

/** A Telegram bot's delivery status, webhook and capabilities, next to its credential form. */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useTelegramBotStatus(() => props.credential.id)
const facts = computed(() => botFactsOf(props.credential.metadata))
</script>

<template>
  <section class="slb-bot-panel">
    <header class="slb-bot-panel__header">
      <h3 class="slb-bot-panel__title">Bot delivery</h3>
      <SlbButton variant="ghost" size="sm" icon-left="action_refresh" :loading="loading" @click="refresh">Refresh</SlbButton>
    </header>

    <SlbAlert v-if="error" variant="error">{{ error }}</SlbAlert>

    <template v-if="status">
      <BotDeliverySummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" />
      <BotWebhookInfo :delivery="status.delivery" :webhook="status.webhook ?? null" :error="status.webhookError ?? null" />
    </template>

    <template v-if="facts">
      <h3 class="slb-bot-panel__title">Capabilities</h3>
      <BotCapabilities :facts="facts" />
    </template>
  </section>
</template>

<style scoped lang="scss">
.slb-bot-panel {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-base);
  margin-top: var(--slb-space-lg);
  padding-top: var(--slb-space-lg);
  border-top: 1px solid var(--slb-color-border);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    margin: 0;
    font-size: var(--slb-font-sm);
    font-weight: var(--slb-fw-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--slb-color-text-muted);
  }
}
</style>
