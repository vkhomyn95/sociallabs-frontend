<script setup lang="ts">
import { computed } from 'vue'
import { SlbTab, SlbTable } from '@sociallabs/frontend-components'
import type { TableColumn } from '@sociallabs/frontend-components'
import BarList from '@/components/stats/BarList.vue'
import ColumnChart from '@/components/stats/ColumnChart.vue'
import MockNotice from '@/components/stats/MockNotice.vue'
import StatCard from '@/components/stats/StatCard.vue'
import StatTile from '@/components/stats/StatTile.vue'
import { AGENT_STATS, AUTOMATION_TOTALS, ERRORS_BY_NODE, PERIOD_TABS, WORKFLOW_STATS, timeline } from './statistics.mock'
import { usePeriod } from './usePeriod'

// Макет «Statistics → Automation»: запуски воркфлоу, помилки, робота і вартість AI-агентів.

const { period, model, scale } = usePeriod()

const runsTimeline = computed(() => timeline(period.value, 2_600, 500, 5))
const errors = computed(() => ERRORS_BY_NODE.map((i) => ({ ...i, value: scale(i.value) })))

const compact = (n: number): string => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n))
const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`

type Wf = (typeof WORKFLOW_STATS)[number]
const workflowColumns: TableColumn<Wf>[] = [
  { key: 'name', label: 'Workflow', minWidth: '220px' },
  { key: 'runs', label: 'Runs', width: '90px', align: 'right' },
  { key: 'success', label: 'Success', width: '90px', align: 'right' },
  { key: 'avgMs', label: 'Avg time', width: '90px', align: 'right' },
  { key: 'lastError', label: 'Top error', minWidth: '180px' },
]

type Ag = (typeof AGENT_STATS)[number]
const agentColumns: TableColumn<Ag>[] = [
  { key: 'name', label: 'Agent', minWidth: '200px' },
  { key: 'runs', label: 'Runs', width: '90px', align: 'right' },
  { key: 'resolved', label: 'Resolved', width: '90px', align: 'right' },
  { key: 'tokens', label: 'Tokens', width: '90px', align: 'right' },
  { key: 'cost', label: 'Cost', width: '90px', align: 'right' },
]
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Automation statistics</h1>
        <p class="mk-page__sub">Workflow executions and AI agents: volume, reliability, where it breaks and what the AI costs.</p>
      </div>
      <div class="st-period"><SlbTab v-model="model" :tabs="PERIOD_TABS" variant="segmented" /></div>
    </header>

    <MockNotice />

    <div class="mk-page__tiles">
      <StatTile label="Executions" icon="action_history" :value="scale(AUTOMATION_TOTALS.executions)" :delta="7" />
      <StatTile label="Success rate" icon="status_success" :value="`${AUTOMATION_TOTALS.successRate}%`" :delta="1" />
      <StatTile label="Failed" icon="status_error" :value="scale(AUTOMATION_TOTALS.failed)" :delta="-9" good-when-down />
      <StatTile label="Avg duration" icon="object_clock" :value="seconds(AUTOMATION_TOTALS.avgDurationMs)" />
      <StatTile label="Agent runs" icon="ai_agent" :value="scale(AUTOMATION_TOTALS.agentRuns)" :delta="18" />
      <StatTile label="Tokens" icon="ai_sparkles" :value="compact(scale(AUTOMATION_TOTALS.tokens))" />
      <StatTile label="AI cost" icon="object_card" :value="`$${(AUTOMATION_TOTALS.aiCost * (scale(1000) / 1000)).toFixed(2)}`" :delta="12" good-when-down />
    </div>

    <div class="mk-page__row">
      <StatCard title="Executions over time">
        <ColumnChart :points="runsTimeline" unit="runs" />
      </StatCard>
      <StatCard title="Errors by node" subtitle="Which step fails most often">
        <BarList :items="errors" tone="error" />
      </StatCard>
    </div>

    <div class="mk-page__row">
      <StatCard title="Workflows">
        <SlbTable :columns="workflowColumns" :data="WORKFLOW_STATS" row-key="id" size="sm" hoverable>
          <template #cell-runs="{ row }"><span class="mk-cell__num">{{ scale(row.runs).toLocaleString() }}</span></template>
          <template #cell-success="{ row }"><span class="mk-cell__num">{{ row.success }}%</span></template>
          <template #cell-avgMs="{ row }"><span class="mk-cell__num">{{ seconds(row.avgMs) }}</span></template>
          <template #cell-lastError="{ row }">
            <span v-if="row.lastError" class="mk-cell__mono mk-cell__muted">{{ row.lastError }}</span>
            <span v-else class="mk-cell__muted">—</span>
          </template>
        </SlbTable>
      </StatCard>
      <StatCard title="AI agents">
        <SlbTable :columns="agentColumns" :data="AGENT_STATS" row-key="id" size="sm" hoverable>
          <template #cell-name="{ row }">
            <span class="mk-cell__name">{{ row.name }}</span>
            <span class="mk-cell__sub mk-cell__mono">{{ row.model }}</span>
          </template>
          <template #cell-runs="{ row }"><span class="mk-cell__num">{{ scale(row.runs).toLocaleString() }}</span></template>
          <template #cell-resolved="{ row }"><span class="mk-cell__num">{{ row.resolved ? `${row.resolved}%` : '—' }}</span></template>
          <template #cell-tokens="{ row }"><span class="mk-cell__num">{{ compact(scale(row.tokens)) }}</span></template>
          <template #cell-cost="{ row }"><span class="mk-cell__num">${{ (row.cost * (scale(1000) / 1000)).toFixed(2) }}</span></template>
        </SlbTable>
      </StatCard>
    </div>
  </div>
</template>

<style lang="scss">
@use './statistics.scss';
</style>
