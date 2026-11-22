<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbButton, SlbTable, SlbToastProvider, slbToast } from '@sociallabs/frontend-components'
import type { TableColumn } from '@sociallabs/frontend-components'
import MockNotice from '@/components/stats/MockNotice.vue'
import StatTile from '@/components/stats/StatTile.vue'
import PlatformIcon from './PlatformIcon.vue'
import { LINKS, LINK_KIND_LABEL } from './marketing.mock'
import { LinkKind } from './marketing.types'
import type { TrackingLink } from './marketing.types'

// Макет «Marketing → Links»: окреме посилання на кожне розміщення, щоб лід мав джерело.

const columns: TableColumn<TrackingLink>[] = [
  { key: 'url', label: 'Link', minWidth: '200px' },
  { key: 'placement', label: 'Placement', minWidth: '200px' },
  { key: 'campaign', label: 'Campaign', minWidth: '220px' },
  { key: 'visits', label: 'Clicks / joins', width: '130px', align: 'right' },
  { key: 'leads', label: 'Leads', width: '80px', align: 'right' },
  { key: 'cr', label: 'CR', width: '80px', align: 'right' },
  { key: 'actions', label: '', width: '56px' },
]

const visits = (l: TrackingLink): number => (l.kind === LinkKind.INVITE ? l.joins : l.clicks)
const cr = (l: TrackingLink): string => (visits(l) ? `${((l.leads / visits(l)) * 100).toFixed(1)}%` : '—')

const totals = computed(() => {
  const v = LINKS.reduce((s, l) => s + visits(l), 0)
  const leads = LINKS.reduce((s, l) => s + l.leads, 0)
  return { links: LINKS.length, visits: v, leads, cr: v ? `${((leads / v) * 100).toFixed(1)}%` : '—' }
})

function copy(l: TrackingLink): void {
  void navigator.clipboard?.writeText(`https://${l.url}`)
  slbToast.success('Link copied')
}

const notYet = (): void => {
  slbToast.info('Not available in the preview yet')
}
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Tracking links</h1>
        <p class="mk-page__sub">
          A unique redirect or Telegram invite link per placement. When someone comes through it and writes to
          you, the dialog gets the campaign and the source channel — that is how leads are attributed.
        </p>
      </div>
      <SlbButton icon-left="action_plus" @click="notYet">New link</SlbButton>
    </header>

    <MockNotice />

    <div class="mk-page__tiles">
      <StatTile label="Active links" icon="action_link" :value="totals.links" />
      <StatTile label="Clicks + joins" icon="arrow_up_right" :value="totals.visits" :delta="14" />
      <StatTile label="Leads" icon="object_user_plus" :value="totals.leads" :delta="9" />
      <StatTile label="Conversion" icon="object_chart" :value="totals.cr" />
    </div>

    <SlbTable :columns="columns" :data="LINKS" row-key="id" size="sm" hoverable>
      <template #cell-url="{ row }">
        <span class="mk-cell__main">
          <PlatformIcon :platform="row.platform" />
          <span>
            <span class="mk-cell__mono">{{ row.url }}</span>
            <span class="mk-cell__sub">{{ LINK_KIND_LABEL[row.kind] }} · {{ row.createdAt }}</span>
          </span>
        </span>
      </template>
      <template #cell-campaign="{ row }">
        <SlbBadge color="gray" size="sm">{{ row.campaign }}</SlbBadge>
      </template>
      <template #cell-visits="{ row }">
        <span class="mk-cell__num">{{ visits(row).toLocaleString() }}</span>
      </template>
      <template #cell-leads="{ row }"><span class="mk-cell__num">{{ row.leads }}</span></template>
      <template #cell-cr="{ row }"><span class="mk-cell__num">{{ cr(row) }}</span></template>
      <template #cell-actions="{ row }">
        <SlbButton variant="ghost" size="sm" icon-only icon-left="action_copy" aria-label="Copy link" @click="copy(row)" />
      </template>
    </SlbTable>

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './marketing.scss';
</style>
