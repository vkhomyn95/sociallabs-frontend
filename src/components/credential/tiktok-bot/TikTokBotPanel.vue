<script setup lang="ts">
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import TikTokBotContacts from './TikTokBotContacts.vue'
import TikTokBotSetupInfo from './TikTokBotSetupInfo.vue'
import TikTokBotSummary from './TikTokBotSummary.vue'
import { TikTokBotService } from './tiktokBot.service'
import { TIKTOK_COUNTERS } from './tiktokBot.ui'

/**
 * A TikTok bot's delivery status, what its account can do, the addresses its TikTok app needs, consent to take over
 * the app's webhook, and who wrote last.
 */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  TikTokBotService.status,
  'Could not load the bot status',
)
</script>

<template>
  <BotPanelFrame title="Bot delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <TikTokBotSummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="TIKTOK_COUNTERS" />
      <TikTokBotSetupInfo :credential-id="credential.id" :status="status" @changed="refresh" />
      <TikTokBotContacts :contacts="status.contacts" />
    </template>
  </BotPanelFrame>
</template>
