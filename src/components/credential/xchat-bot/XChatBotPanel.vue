<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import XChatBotSummary from './XChatBotSummary.vue'
import XChatSetupInfo from './XChatSetupInfo.vue'
import { XChatBotService } from './xchatBot.service'
import { XCHAT_COUNTERS } from './xchatBot.ui'

/** An XChat bot's delivery status, its account and key, and what its X app needs, with a word on what X bills. */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  XChatBotService.status,
  'Could not load the bot status',
)
</script>

<template>
  <BotPanelFrame title="Bot delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <XChatBotSummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="XCHAT_COUNTERS" />
      <XChatSetupInfo :status="status" />
    </template>

    <SlbAlert variant="info" title="Pay-per-use">
      X bills your X app for every message delivered to the bot (about $0.01 each) and for what the bot sends. The bot
      subscribes only to the events its active triggers listen to.
    </SlbAlert>
  </BotPanelFrame>
</template>
