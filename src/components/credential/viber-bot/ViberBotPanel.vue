<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import ViberBotSummary from './ViberBotSummary.vue'
import ViberWebhookInfo from './ViberWebhookInfo.vue'
import { ViberBotService } from './viberBot.service'
import { VIBER_COUNTERS } from './viberBot.ui'

/** A Viber bot's delivery status, webhook and users, next to its credential form, with a word on what Viber bills. */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  ViberBotService.status,
  'Could not load the bot status',
)
</script>

<template>
  <BotPanelFrame title="Bot delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <ViberBotSummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="VIBER_COUNTERS" />
      <ViberWebhookInfo :status="status" />
    </template>

    <SlbAlert variant="info" title="Paid messages">
      Replies in a conversation the user started are free. Messages the bot starts, broadcasts included, are billed by
      Viber to the bot's account.
    </SlbAlert>
  </BotPanelFrame>
</template>
