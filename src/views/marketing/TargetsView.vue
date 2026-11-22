<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SlbBadge,
  SlbButton,
  SlbIcon,
  SlbInput,
  SlbTab,
  SlbTable,
  SlbToastProvider,
  slbToast,
} from '@sociallabs/frontend-components'
import type { TabItem, TableColumn } from '@sociallabs/frontend-components'
import MockNotice from '@/components/stats/MockNotice.vue'
import PlatformIcon from './PlatformIcon.vue'
import { TARGETS, TARGET_KIND_LABEL, TARGET_STATUS_META } from './marketing.mock'
import { TargetStatus } from './marketing.types'
import type { Target } from './marketing.types'

// Макет «Marketing → Targets»: база знайдених каналів / груп / постів / профілів.

const ALL = 'all'
const targets = reactive<Target[]>(structuredClone(TARGETS))
const status = ref<string>(ALL)
const search = ref('')
const selected = ref<Target[]>([])

const tabs = computed<TabItem[]>(() => [
  { key: ALL, label: 'All', badge: targets.length },
  ...Object.values(TargetStatus).map((s) => ({
    key: s,
    label: TARGET_STATUS_META[s].label,
    badge: targets.filter((t) => t.status === s).length,
  })),
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return targets
    .filter((t) => status.value === ALL || t.status === status.value)
    .filter((t) => !q || [t.title, t.handle, ...t.topics].some((s) => s.toLowerCase().includes(q)))
})

const columns: TableColumn<Target>[] = [
  { key: 'title', label: 'Target', minWidth: '260px' },
  { key: 'kind', label: 'Type', width: '100px' },
  { key: 'audience', label: 'Audience', width: '110px', align: 'right', sortable: true },
  { key: 'er', label: 'ER', width: '80px', align: 'right', sortable: true },
  { key: 'commentsOpen', label: 'Comments', width: '100px' },
  { key: 'topics', label: 'Topics', minWidth: '150px' },
  { key: 'leads', label: 'Leads', width: '80px', align: 'right', sortable: true },
  { key: 'status', label: 'Status', width: '130px' },
]

function setStatus(next: TargetStatus): void {
  selected.value.forEach((t) => (t.status = next))
  slbToast.success(`${selected.value.length} targets → ${TARGET_STATUS_META[next].label}`)
  selected.value = []
}

const notYet = (): void => {
  slbToast.info('Not available in the preview yet')
}
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Targets</h1>
        <p class="mk-page__sub">
          Everything the scraper found, in one deduplicated base. Approve targets to use them in campaigns,
          exclude the irrelevant ones — targets that banned us are marked automatically.
        </p>
      </div>
      <div class="mk-page__actions">
        <SlbButton variant="secondary" icon-left="action_upload" @click="notYet">Import</SlbButton>
        <SlbButton variant="secondary" icon-left="action_download" @click="notYet">Export CSV</SlbButton>
      </div>
    </header>

    <MockNotice />

    <div class="mk-page__toolbar">
      <SlbTab v-model="status" :tabs="tabs" variant="segmented" />
      <div class="mk-page__actions">
        <template v-if="selected.length">
          <SlbButton size="sm" variant="secondary" icon-left="action_check" @click="setStatus(TargetStatus.APPROVED)">
            Approve {{ selected.length }}
          </SlbButton>
          <SlbButton size="sm" variant="secondary" icon-left="action_close" @click="setStatus(TargetStatus.EXCLUDED)">
            Exclude
          </SlbButton>
        </template>
        <SlbInput v-model="search" class="mk-page__search" size="sm" icon-left="action_search" placeholder="Search by name, @handle, topic" clearable />
      </div>
    </div>

    <SlbTable
      :columns="columns"
      :data="filtered"
      row-key="id"
      size="sm"
      selectable
      hoverable
      empty-icon="dev_database"
      empty-text="No targets match"
      @select="selected = $event"
    >
      <template #cell-title="{ row }">
        <span class="mk-cell__main">
          <PlatformIcon :platform="row.platform" />
          <span>
            <span class="mk-cell__name">{{ row.title }}</span>
            <span class="mk-cell__sub">{{ row.handle }} · via {{ row.sourceJob }} · {{ row.foundAt }}</span>
          </span>
        </span>
      </template>
      <template #cell-kind="{ row }">{{ TARGET_KIND_LABEL[row.kind] }}</template>
      <template #cell-audience="{ row }">
        <span class="mk-cell__num">{{ row.audience ? row.audience.toLocaleString() : '—' }}</span>
      </template>
      <template #cell-er="{ row }">
        <span class="mk-cell__num">{{ row.er ? `${row.er}%` : '—' }}</span>
      </template>
      <template #cell-commentsOpen="{ row }">
        <SlbIcon
          :name="row.commentsOpen ? 'status_success' : 'action_minus'"
          :size="14"
          :color="row.commentsOpen ? 'var(--slb-color-success)' : 'var(--slb-color-gray-400)'"
        />
        <span class="mk-cell__muted"> {{ row.commentsOpen ? 'Open' : 'Closed' }}</span>
      </template>
      <template #cell-topics="{ row }">
        <div class="mk-cell__chips">
          <SlbBadge v-for="tp in row.topics" :key="tp" color="gray" size="sm">{{ tp }}</SlbBadge>
          <SlbBadge color="gray" size="sm">{{ row.language }}</SlbBadge>
        </div>
      </template>
      <template #cell-leads="{ row }">
        <span class="mk-cell__num">{{ row.leads || '—' }}</span>
      </template>
      <template #cell-status="{ row }">
        <SlbBadge :color="TARGET_STATUS_META[row.status].color" dot>{{ TARGET_STATUS_META[row.status].label }}</SlbBadge>
      </template>
    </SlbTable>

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './marketing.scss';
</style>
