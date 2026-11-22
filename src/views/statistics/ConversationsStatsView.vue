<script setup lang="ts">
import { computed } from 'vue'
import { SlbTab } from '@sociallabs/frontend-components'
import BarList from '@/components/stats/BarList.vue'
import ColumnChart from '@/components/stats/ColumnChart.vue'
import MockNotice from '@/components/stats/MockNotice.vue'
import StatCard from '@/components/stats/StatCard.vue'
import StatTile from '@/components/stats/StatTile.vue'
import {
  CONVERSATION_TOTALS,
  DIALOGS_BY_CHANNEL,
  DIALOGS_BY_HANDLER,
  HANDOFF_REASONS,
  PERIOD_TABS,
  timeline,
} from './statistics.mock'
import { usePeriod } from './usePeriod'

// Макет «Statistics → Conversations»: обсяг діалогів, швидкість відповіді, хто їх закриває.

const { period, model, scale } = usePeriod()

const dialogsTimeline = computed(() => timeline(period.value, 180, 45, 3))
const scaleItems = <T extends { value: number }>(items: T[]): T[] => items.map((i) => ({ ...i, value: scale(i.value) }))
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Conversation statistics</h1>
        <p class="mk-page__sub">Volume of dialogs across accounts and bots, response speed and who resolves them — AI, workflow or operator.</p>
      </div>
      <div class="st-period"><SlbTab v-model="model" :tabs="PERIOD_TABS" variant="segmented" /></div>
    </header>

    <MockNotice />

    <div class="mk-page__tiles">
      <StatTile label="Dialogs" icon="object_comments" :value="scale(CONVERSATION_TOTALS.dialogs)" :delta="6" />
      <StatTile label="New contacts" icon="object_user_plus" :value="scale(CONVERSATION_TOTALS.newContacts)" :delta="11" />
      <StatTile label="Messages in / out" icon="chat_bubble" :value="`${scale(CONVERSATION_TOTALS.messagesIn).toLocaleString()} / ${scale(CONVERSATION_TOTALS.messagesOut).toLocaleString()}`" />
      <StatTile label="First response" icon="object_clock" :value="`${CONVERSATION_TOTALS.firstResponseSec}s`" :delta="-12" good-when-down />
      <StatTile label="Resolved by AI" icon="ai_sparkle" :value="`${CONVERSATION_TOTALS.resolvedByAi}%`" :delta="3" />
      <StatTile label="Handed to operator" icon="chat_operator" :value="`${CONVERSATION_TOTALS.handoff}%`" :delta="-2" good-when-down />
      <StatTile label="Unanswered" icon="status_warning" :value="CONVERSATION_TOTALS.unanswered" hint="older than 1 h" />
    </div>

    <div class="mk-page__row">
      <StatCard title="Dialogs over time">
        <ColumnChart :points="dialogsTimeline" unit="dialogs" />
      </StatCard>
      <StatCard title="Dialogs by channel">
        <BarList :items="scaleItems(DIALOGS_BY_CHANNEL)" />
      </StatCard>
    </div>

    <div class="mk-page__row">
      <StatCard title="Who handled the dialog">
        <BarList :items="scaleItems(DIALOGS_BY_HANDLER)" />
      </StatCard>
      <StatCard title="Why AI handed off" subtitle="Tune agent guardrails from Agents → Guardrails">
        <BarList :items="scaleItems(HANDOFF_REASONS)" tone="warning" />
      </StatCard>
    </div>
  </div>
</template>

<style lang="scss">
@use './statistics.scss';
</style>
