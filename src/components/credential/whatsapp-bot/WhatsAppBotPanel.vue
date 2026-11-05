<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import WhatsAppBotSummary from './WhatsAppBotSummary.vue'
import WhatsAppWebhookInfo from './WhatsAppWebhookInfo.vue'
import { WhatsAppBotService } from './whatsappBot.service'
import { WHATSAPP_COUNTERS } from './whatsappBot.ui'

/**
 * A WhatsApp Business number's delivery status, quality, webhook and users, next to its credential form, with a word on
 * what Meta bills and on its policy for AI assistants.
 */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  WhatsAppBotService.status,
  'Could not load the number status',
)
</script>

<template>
  <BotPanelFrame title="Number delivery" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <WhatsAppBotSummary :status="status" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="WHATSAPP_COUNTERS" />
      <WhatsAppWebhookInfo :status="status" />
    </template>

    <SlbAlert variant="info" title="Paid messages">
      Meta bills delivered templates by category (marketing, utility, authentication). Free-form messages are allowed
      only within 24 hours of the user's last message; after that only a template may be sent.
    </SlbAlert>
    <SlbAlert variant="info" title="AI assistants">
      Meta allows bots for a specific business task only; general-purpose AI assistants are not allowed on the
      WhatsApp Business Platform.
    </SlbAlert>
  </BotPanelFrame>
</template>
