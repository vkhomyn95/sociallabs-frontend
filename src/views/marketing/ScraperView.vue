<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SlbBadge,
  SlbButton,
  SlbDrawer,
  SlbIcon,
  SlbInput,
  SlbSelect,
  SlbTable,
  SlbToastProvider,
  SlbToggle,
  slbToast,
} from '@sociallabs/frontend-components'
import type { SelectOption, TableColumn } from '@sociallabs/frontend-components'
import MockNotice from '@/components/stats/MockNotice.vue'
import StatTile from '@/components/stats/StatTile.vue'
import PlatformIcon from './PlatformIcon.vue'
import { JOB_STATUS_META, PLATFORM_META, SCRAPE_JOBS, SOURCE_META } from './marketing.mock'
import { JobStatus, Platform, ScrapeSource } from './marketing.types'
import type { ScrapeJob } from './marketing.types'

// Макет «Marketing → Scraper»: пошукові задачі, які від імені акаунта збирають цілі в базу Targets.

const jobs = reactive<ScrapeJob[]>(structuredClone(SCRAPE_JOBS))
const drawerOpen = ref(false)

const columns: TableColumn<ScrapeJob>[] = [
  { key: 'name', label: 'Search', minWidth: '240px' },
  { key: 'source', label: 'Source', width: '170px' },
  { key: 'query', label: 'Query & filters', minWidth: '260px' },
  { key: 'schedule', label: 'Schedule', width: '130px' },
  { key: 'found', label: 'Found', width: '110px', align: 'right' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'actions', label: '', width: '56px' },
]

const totals = computed(() => ({
  found: jobs.reduce((s, j) => s + j.found, 0),
  fresh: jobs.reduce((s, j) => s + j.newLastRun, 0),
  running: jobs.filter((j) => j.status === JobStatus.RUNNING).length,
  failed: jobs.filter((j) => j.status === JobStatus.FAILED).length,
}))

// ── Форма нової задачі (лише макет: значення ніде не зберігаються) ──
const form = reactive({
  name: '',
  platform: Platform.TELEGRAM as string,
  source: ScrapeSource.CHANNEL_SEARCH as string,
  keywords: '',
  exclude: '',
  minAudience: '1000',
  language: 'uk',
  postedWithin: '7',
  commentsOpen: true,
  skipKnown: true,
  autoApprove: false,
  account: 'tg-me',
  schedule: 'daily',
})

const platformOptions: SelectOption[] = Object.values(Platform).map((p) => ({
  value: p,
  label: PLATFORM_META[p].label,
  icon: PLATFORM_META[p].icon,
}))
const sourceOptions: SelectOption[] = Object.values(ScrapeSource).map((s) => ({
  value: s,
  label: SOURCE_META[s].label,
  icon: SOURCE_META[s].icon,
}))
const languageOptions: SelectOption[] = [
  { value: 'any', label: 'Any language' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polish' },
]
const accountOptions: SelectOption[] = [
  { value: 'tg-me', label: '@vkhomyn', icon: 'brand_telegram', description: 'Personal · Telegram' },
  { value: 'tg-2', label: '@growth_acc_2', icon: 'brand_telegram', description: 'Personal · Telegram' },
  { value: 'tt-1', label: 'sociallabs.tt', icon: 'brand_tiktok', description: 'Account · TikTok' },
]
const scheduleOptions: SelectOption[] = [
  { value: 'once', label: 'Run once' },
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

const asString = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''))

function create(): void {
  drawerOpen.value = false
  slbToast.info('Preview only — the scraper backend is not built yet')
}

const notYet = (): void => {
  slbToast.info('Not available in the preview yet')
}
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Scraper</h1>
        <p class="mk-page__sub">
          Search jobs run from a connected account and collect channels, chats, posts or chat members that
          match your query and filters. Results land in Targets, deduplicated.
        </p>
      </div>
      <SlbButton icon-left="action_plus" @click="drawerOpen = true">New search</SlbButton>
    </header>

    <MockNotice />

    <div class="mk-page__tiles">
      <StatTile label="Targets found" icon="dev_database" :value="totals.found" />
      <StatTile label="New on last runs" icon="action_plus" :value="totals.fresh" />
      <StatTile label="Running now" icon="shape_spinner" :value="totals.running" />
      <StatTile label="Failed / limited" icon="status_warning" :value="totals.failed" hint="FLOOD_WAIT, captcha, ban" />
    </div>

    <SlbTable :columns="columns" :data="jobs" row-key="id" size="sm" hoverable>
      <template #cell-name="{ row }">
        <span class="mk-cell__main">
          <PlatformIcon :platform="row.platform" />
          <span>
            <span class="mk-cell__name">{{ row.name }}</span>
            <span class="mk-cell__sub">as {{ row.account }} · last run {{ row.lastRun }}</span>
            <span v-if="row.note" class="mk-cell__error">{{ row.note }}</span>
          </span>
        </span>
      </template>
      <template #cell-source="{ row }">
        <span class="mk-cell__main">
          <SlbIcon :name="SOURCE_META[row.source].icon" :size="14" />
          {{ SOURCE_META[row.source].label }}
        </span>
      </template>
      <template #cell-query="{ row }">
        <div class="mk-cell__chips">
          <SlbBadge v-for="q in row.query" :key="q" color="primary" size="sm">{{ q }}</SlbBadge>
          <SlbBadge v-for="f in row.filters" :key="f" color="gray" size="sm">{{ f }}</SlbBadge>
        </div>
      </template>
      <template #cell-found="{ row }">
        <span class="mk-cell__num">{{ row.found.toLocaleString() }}</span>
        <span v-if="row.newLastRun" class="mk-cell__sub">+{{ row.newLastRun }} new</span>
      </template>
      <template #cell-status="{ row }">
        <SlbBadge :color="JOB_STATUS_META[row.status].color" dot>{{ JOB_STATUS_META[row.status].label }}</SlbBadge>
      </template>
      <template #cell-actions>
        <SlbButton variant="ghost" size="sm" icon-only icon-left="media_play" aria-label="Run now" @click="notYet" />
      </template>
    </SlbTable>

    <SlbDrawer v-model="drawerOpen" placement="right" :size="560" title="New search">
      <div class="mk-form">
        <SlbInput v-model="form.name" label="Name" placeholder="e.g. Crypto UA channels" />
        <div class="mk-form__row">
          <SlbSelect :model-value="form.platform" label="Platform" :options="platformOptions" @update:model-value="form.platform = asString($event)" />
          <SlbSelect :model-value="form.source" label="What to search" :options="sourceOptions" @update:model-value="form.source = asString($event)" />
        </div>

        <div class="mk-form__group">
          <span class="mk-form__label">Query</span>
          <SlbInput v-model="form.keywords" label="Keywords / hashtags / seed channels" placeholder="крипта, трейдинг, #smm, @marketing_ua" />
          <SlbInput v-model="form.exclude" label="Exclude words" placeholder="casino, 18+" />
          <p class="mk-form__hint">An AI agent can expand the keywords with synonyms and translations before the search.</p>
        </div>

        <div class="mk-form__group">
          <span class="mk-form__label">Filters</span>
          <div class="mk-form__row">
            <SlbInput v-model="form.minAudience" label="Min subscribers / views" type="number" />
            <SlbInput v-model="form.postedWithin" label="Last post within, days" type="number" />
          </div>
          <SlbSelect :model-value="form.language" label="Language" :options="languageOptions" @update:model-value="form.language = asString($event)" />
          <SlbToggle v-model="form.commentsOpen" label="Only with open comments" />
          <SlbToggle v-model="form.skipKnown" label="Skip targets already in the base" />
          <SlbToggle v-model="form.autoApprove" label="Auto-approve matches (skip manual review)" />
        </div>

        <div class="mk-form__group">
          <span class="mk-form__label">Run</span>
          <div class="mk-form__row">
            <SlbSelect :model-value="form.account" label="Search as account" :options="accountOptions" @update:model-value="form.account = asString($event)" />
            <SlbSelect :model-value="form.schedule" label="Schedule" :options="scheduleOptions" @update:model-value="form.schedule = asString($event)" />
          </div>
          <p class="mk-form__hint">The job pauses itself on FLOOD_WAIT or captcha and resumes after the cooldown.</p>
        </div>
      </div>
      <template #footer>
        <div class="mk-form__foot">
          <SlbButton variant="secondary" @click="drawerOpen = false">Cancel</SlbButton>
          <SlbButton @click="create">Create search</SlbButton>
        </div>
      </template>
    </SlbDrawer>

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './marketing.scss';
</style>
