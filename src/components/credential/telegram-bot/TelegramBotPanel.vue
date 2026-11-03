<script setup lang="ts">
import { computed } from 'vue'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import BotCapabilities from './BotCapabilities.vue'
import BotDeliverySummary from './BotDeliverySummary.vue'
import BotWebhookInfo from './BotWebhookInfo.vue'
import { TelegramBotService } from './telegramBot.service'
import { COUNTERS } from './telegramBot.ui'
import { botFactsOf } from './telegramBotFacts'

/** A Telegram bot's delivery status, webhook and capabilities, next to its credential form. */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  TelegramBotService.status,
  'Could not load the bot status',
)
const facts = computed(() => botFactsOf(props.credential.metadata))
</script>

<template>
  <BotPanelFrame title="Bot delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <BotDeliverySummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="COUNTERS" />
      <BotWebhookInfo :delivery="status.delivery" :webhook="status.webhook ?? null" :error="status.webhookError ?? null" />
    </template>

    <template v-if="facts">
      <h3 class="slb-bot-panel__title">Capabilities</h3>
      <BotCapabilities :facts="facts" />
    </template>
  </BotPanelFrame>
</template>
