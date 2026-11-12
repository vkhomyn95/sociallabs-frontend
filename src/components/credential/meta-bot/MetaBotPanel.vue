<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { useBotStatus } from '../bot-common/useBotStatus'
import MetaBotSummary from './MetaBotSummary.vue'
import MetaWebhookSetup from './MetaWebhookSetup.vue'
import { META_COUNTERS, type MetaBotPlatformUi } from './metaBot.ui'

/**
 * A Meta bot's delivery status, account, webhook setup and users, next to its credential form; the platform says how
 * its account reads, its App Dashboard steps and its notes.
 */
const props = defineProps<{ credential: Credential; platform: MetaBotPlatformUi }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  props.platform.load,
  props.platform.loadError,
)
</script>

<template>
  <BotPanelFrame :title="platform.title" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <MetaBotSummary :status="status" :platform="platform" />
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="META_COUNTERS" />
      <MetaWebhookSetup :status="status" :steps="platform.dashboardSteps" />
    </template>

    <SlbAlert v-for="note in platform.notes" :key="note.title" variant="info" :title="note.title">
      {{ note.text }}
    </SlbAlert>
  </BotPanelFrame>
</template>
