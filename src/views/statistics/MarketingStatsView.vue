<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbTab, SlbTable } from '@sociallabs/frontend-components'
import type { BadgeColor, TableColumn } from '@sociallabs/frontend-components'
import BarList from '@/components/stats/BarList.vue'
import ColumnChart from '@/components/stats/ColumnChart.vue'
import FunnelChart from '@/components/stats/FunnelChart.vue'
import MockNotice from '@/components/stats/MockNotice.vue'
import StatCard from '@/components/stats/StatCard.vue'
import StatTile from '@/components/stats/StatTile.vue'
import {
  ACCOUNT_HEALTH,
  ACTIONS_BY_TYPE,
  BLOCKS_BY_REASON,
  CAMPAIGN_EFFICIENCY,
  LEADS_BY_CHANNEL,
  MARKETING_FUNNEL,
  MARKETING_TOTALS,
  PERIOD_TABS,
  timeline,
} from './statistics.mock'
import { usePeriod } from './usePeriod'

// Макет «Statistics → Marketing»: від спарсених цілей до лідів, ефективність і блокування.

const { period, model, scale } = usePeriod()

const leadsTimeline = computed(() => timeline(period.value, 30, 9, 1))
const funnel = computed(() => MARKETING_FUNNEL.map((s) => ({ ...s, value: scale(s.value) })))

type Row = (typeof CAMPAIGN_EFFICIENCY)[number]
const campaignColumns: TableColumn<Row>[] = [
  { key: 'name', label: 'Campaign', minWidth: '240px' },
  { key: 'actions', label: 'Actions', width: '100px', align: 'right' },
  { key: 'clicks', label: 'Clicks', width: '90px', align: 'right' },
  { key: 'leads', label: 'Leads', width: '80px', align: 'right' },
  { key: 'perLead', label: 'Actions / lead', width: '120px', align: 'right' },
  { key: 'blocks', label: 'Blocks', width: '80px', align: 'right' },
]

type Health = (typeof ACCOUNT_HEALTH)[number]
const healthColumns: TableColumn<Health>[] = [
  { key: 'account', label: 'Account', minWidth: '180px' },
  { key: 'actions', label: 'Actions', width: '100px', align: 'right' },
  { key: 'state', label: 'State', minWidth: '220px' },
]
const HEALTH_META: Record<string, { label: string; color: BadgeColor }> = {
  ok: { label: 'Healthy', color: 'success' },
  limited: { label: 'Rate-limited', color: 'warning' },
  spam: { label: 'Spam block', color: 'error' },
}
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Marketing statistics</h1>
        <p class="mk-page__sub">How scraping and campaigns turn into leads, which channels work and where we get blocked.</p>
      </div>
      <div class="st-period"><SlbTab v-model="model" :tabs="PERIOD_TABS" variant="segmented" /></div>
    </header>

    <MockNotice />

    <div class="mk-page__tiles">
      <StatTile label="Targets scraped" icon="dev_database" :value="scale(MARKETING_TOTALS.targetsScraped)" :delta="12" />
      <StatTile label="Comments left" icon="chat_bubble_text" :value="scale(MARKETING_TOTALS.comments)" :delta="8" />
      <StatTile label="Ad posts" icon="chat_broadcast" :value="scale(MARKETING_TOTALS.posts)" :delta="-4" />
      <StatTile label="Messages sent" icon="action_send" :value="scale(MARKETING_TOTALS.messagesSent)" :hint="`${MARKETING_TOTALS.deliveryRate}% delivered`" />
      <StatTile label="Clicks / joins" icon="arrow_up_right" :value="scale(MARKETING_TOTALS.clicks)" :delta="15" />
      <StatTile label="Leads" icon="object_user_plus" :value="scale(MARKETING_TOTALS.leads)" :delta="9" />
      <StatTile label="Blocks" icon="object_lock" :value="scale(MARKETING_TOTALS.blocks)" :delta="21" good-when-down />
    </div>

    <div class="mk-page__row">
      <StatCard title="Funnel" subtitle="Step-to-step conversion on the right">
        <FunnelChart :steps="funnel" />
      </StatCard>
      <StatCard title="Leads over time" subtitle="Dialogs that came through a tracking link">
        <ColumnChart :points="leadsTimeline" unit="leads" />
      </StatCard>
    </div>

    <div class="mk-page__row">
      <StatCard title="Leads by source" subtitle="Channel or placement the lead came from">
        <BarList :items="LEADS_BY_CHANNEL" />
      </StatCard>
      <StatCard title="Actions by type">
        <BarList :items="ACTIONS_BY_TYPE" />
      </StatCard>
    </div>

    <div class="mk-page__row">
      <StatCard title="Where we get blocked" subtitle="Lower is better — high numbers mean limits are too aggressive">
        <BarList :items="BLOCKS_BY_REASON" tone="error" />
      </StatCard>
      <StatCard title="Account health" subtitle="Accounts used by campaigns and scraper">
        <SlbTable :columns="healthColumns" :data="ACCOUNT_HEALTH" row-key="account" size="sm">
          <template #cell-account="{ row }">
            <span class="mk-cell__name">{{ row.account }}</span>
            <span class="mk-cell__sub">{{ row.platform }}</span>
          </template>
          <template #cell-actions="{ row }"><span class="mk-cell__num">{{ scale(row.actions).toLocaleString() }}</span></template>
          <template #cell-state="{ row }">
            <SlbBadge :color="HEALTH_META[row.state]?.color ?? 'gray'" dot>{{ HEALTH_META[row.state]?.label }}</SlbBadge>
            <span v-if="row.note" class="mk-cell__sub">{{ row.note }}</span>
          </template>
        </SlbTable>
      </StatCard>
    </div>

    <StatCard title="Campaign efficiency">
      <SlbTable :columns="campaignColumns" :data="CAMPAIGN_EFFICIENCY" row-key="id" size="sm" hoverable>
        <template #cell-actions="{ row }"><span class="mk-cell__num">{{ scale(row.actions).toLocaleString() }}</span></template>
        <template #cell-clicks="{ row }"><span class="mk-cell__num">{{ scale(row.clicks).toLocaleString() }}</span></template>
        <template #cell-leads="{ row }"><span class="mk-cell__num">{{ scale(row.leads) }}</span></template>
        <template #cell-perLead="{ row }"><span class="mk-cell__num">{{ (row.actions / row.leads).toFixed(1) }}</span></template>
        <template #cell-blocks="{ row }"><span class="mk-cell__num">{{ scale(row.blocks) }}</span></template>
      </SlbTable>
    </StatCard>
  </div>
</template>

<style lang="scss">
@use './statistics.scss';
</style>
