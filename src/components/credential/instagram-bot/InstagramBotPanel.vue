<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import InstagramBotSummary from './InstagramBotSummary.vue'
import InstagramWebhookSetup from './InstagramWebhookSetup.vue'
import { InstagramBotService } from './instagramBot.service'
import { INSTAGRAM_COUNTERS } from './instagramBot.ui'

/**
 * A professional Instagram account's delivery status, token, webhook setup and users, next to its credential form,
 * with a word on what the API allows.
 */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  InstagramBotService.status,
  'Could not load the account status',
)
</script>

<template>
  <BotPanelFrame title="Account delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <InstagramBotSummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="INSTAGRAM_COUNTERS" />
      <InstagramWebhookSetup :status="status" />
    </template>

    <SlbAlert variant="info" title="Users write first">
      The account may answer a user within 24 hours of their last message; it cannot start a conversation. A comment may
      get one private reply within 7 days.
    </SlbAlert>
    <SlbAlert variant="info" title="Token renewal">
      The token lives 60 days; the server renews it on its own before it expires. A token left to expire cannot be
      renewed: generate a new one in the Meta app.
    </SlbAlert>
  </BotPanelFrame>
</template>
