<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import {
  SlbBadge,
  SlbButton,
  SlbDropdown,
  SlbIcon,
  SlbInput,
  SlbTab,
  SlbToastProvider,
  slbToast,
} from '@sociallabs/frontend-components'
import type { MenuItem, SlbIconName, TabItem } from '@sociallabs/frontend-components'
import MockNotice from '@/components/stats/MockNotice.vue'
import { RouteName } from '@/layouts/navigation'
import BroadcastDrawer from './campaign/BroadcastDrawer.vue'
import CommentingDrawer from './campaign/CommentingDrawer.vue'
import EngagementDrawer from './campaign/EngagementDrawer.vue'
import PostingDrawer from './campaign/PostingDrawer.vue'
import PlatformIcon from './PlatformIcon.vue'
import { CAMPAIGNS, CAMPAIGN_STATUS_META, CAMPAIGN_TYPE_META, PLATFORM_META, ROADMAP_IDEAS } from './marketing.mock'
import { CampaignStatus, CampaignType, ExecutorKind } from './marketing.types'
import type { Campaign } from './marketing.types'

// Макет «Marketing → Campaigns»: що робимо зі знайденими цілями і хто це виконує.

const ALL = 'all'
const campaigns = reactive<Campaign[]>(structuredClone(CAMPAIGNS))
const type = ref<string>(ALL)
const search = ref('')

const PIPELINE: { name: string; text: string; icon: SlbIconName; route: RouteName }[] = [
  { name: 'Scraper', text: 'Accounts search channels, chats and posts by your settings', icon: 'action_search', route: RouteName.MARKETING_SCRAPER },
  { name: 'Targets', text: 'Deduplicated base of what was found — approve or exclude', icon: 'dev_database', route: RouteName.MARKETING_TARGETS },
  { name: 'Campaigns', text: 'Comment, post, broadcast or react — by a workflow or an agent', icon: 'chat_broadcast', route: RouteName.MARKETING_CAMPAIGNS },
  { name: 'Links', text: 'A tracked link per placement turns clicks into attributed leads', icon: 'action_link', route: RouteName.MARKETING_LINKS },
  { name: 'Statistics', text: 'Funnel, efficiency per channel, blocks and limits', icon: 'object_chart', route: RouteName.STATS_MARKETING },
]

const tabs = computed<TabItem[]>(() => [
  { key: ALL, label: 'All', badge: campaigns.length },
  ...Object.values(CampaignType).map((t) => ({
    key: t,
    label: CAMPAIGN_TYPE_META[t].label,
    icon: CAMPAIGN_TYPE_META[t].icon,
    badge: campaigns.filter((c) => c.type === t).length,
  })),
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return campaigns
    .filter((c) => type.value === ALL || c.type === type.value)
    .filter((c) => !q || [c.name, c.targetList, c.executor.name].some((s) => s.toLowerCase().includes(q)))
})

const menu = (c: Campaign): MenuItem[] => [
  { key: 'edit', label: 'Edit', icon: 'action_edit' },
  c.status === CampaignStatus.RUNNING
    ? { key: 'toggle', label: 'Pause', icon: 'media_pause' }
    : { key: 'toggle', label: 'Start', icon: 'media_play' },
  { key: 'stats', label: 'Open statistics', icon: 'object_chart' },
  { key: 'divider', type: 'divider' },
  { key: 'delete', label: 'Delete', icon: 'action_trash', danger: true },
]

function onMenu(c: Campaign, item: MenuItem): void {
  if (item.key === 'edit') {
    openCampaign(c, c.type)
  } else if (item.key === 'toggle') {
    c.status = c.status === CampaignStatus.RUNNING ? CampaignStatus.PAUSED : CampaignStatus.RUNNING
    slbToast.info(`«${c.name}» ${c.status === CampaignStatus.RUNNING ? 'started' : 'paused'}`)
  } else {
    slbToast.info('Not available in the preview yet')
  }
}

// ── Drawer кампанії: свій на кожен тип, форма будується з кампанії при відкритті ──
const DRAWERS: Record<CampaignType, Component> = {
  [CampaignType.COMMENTING]: CommentingDrawer,
  [CampaignType.POSTING]: PostingDrawer,
  [CampaignType.BROADCAST]: BroadcastDrawer,
  [CampaignType.ENGAGEMENT]: EngagementDrawer,
}
const drawerOpen = ref(false)
const drawerType = ref<CampaignType>(CampaignType.COMMENTING)
const drawerCampaign = ref<Campaign | null>(null)
// Новий key на кожне відкриття — drawer перемонтовується і бере свіжі значення з кампанії.
const drawerKey = ref(0)

function openCampaign(c: Campaign | null, kind: CampaignType): void {
  drawerType.value = kind
  drawerCampaign.value = c
  drawerKey.value++
  drawerOpen.value = true
}

const newMenu: MenuItem[] = Object.values(CampaignType).map((t) => ({
  key: t,
  label: CAMPAIGN_TYPE_META[t].label,
  description: CAMPAIGN_TYPE_META[t].hint,
  icon: CAMPAIGN_TYPE_META[t].icon,
}))

function onNew(item: MenuItem): void {
  const kind = Object.values(CampaignType).find((t) => t === item.key)
  if (kind) openCampaign(null, kind)
}
</script>

<template>
  <div class="mk-page">
    <header class="mk-page__head">
      <div>
        <h1 class="mk-page__title">Campaigns</h1>
        <p class="mk-page__sub">
          Automated outreach on top of the targets found by the scraper: comments under new posts, ad posts,
          broadcasts and engagement — run by workflows or AI agents from your connected accounts.
        </p>
      </div>
      <SlbDropdown :items="newMenu" placement="bottom-end" @select="onNew">
        <SlbButton icon-left="action_plus" icon-right="arrow_down">New campaign</SlbButton>
      </SlbDropdown>
    </header>

    <MockNotice />

    <nav class="mk-pipeline" aria-label="How marketing works">
      <template v-for="(step, i) in PIPELINE" :key="step.name">
        <RouterLink :to="{ name: step.route }" class="mk-pipeline__step">
          <span class="mk-pipeline__icon"><SlbIcon :name="step.icon" :size="16" /></span>
          <span>
            <span class="mk-pipeline__name">{{ step.name }}</span>
            <span class="mk-pipeline__text">{{ step.text }}</span>
          </span>
        </RouterLink>
        <SlbIcon v-if="i < PIPELINE.length - 1" name="arrow_right" :size="16" class="mk-pipeline__arrow" />
      </template>
    </nav>

    <div class="mk-page__toolbar">
      <SlbTab v-model="type" :tabs="tabs" variant="segmented" />
      <SlbInput v-model="search" class="mk-page__search" size="sm" icon-left="action_search" placeholder="Search campaigns" clearable />
    </div>

    <div class="mk-page__grid">
      <article
        v-for="c in filtered"
        :key="c.id"
        class="mk-card mk-card--clickable"
        tabindex="0"
        @click="openCampaign(c, c.type)"
        @keydown.enter.self="openCampaign(c, c.type)"
      >
        <header class="mk-card__head">
          <span class="mk-card__icon" :class="`mk-tone--${CAMPAIGN_TYPE_META[c.type].color}`">
            <SlbIcon :name="CAMPAIGN_TYPE_META[c.type].icon" :size="18" />
          </span>
          <div class="mk-card__title">
            <h3 class="mk-card__name">{{ c.name }}</h3>
            <span class="mk-card__meta">
              {{ CAMPAIGN_TYPE_META[c.type].label }} · {{ PLATFORM_META[c.platform].label }}
            </span>
          </div>
          <SlbBadge :color="CAMPAIGN_STATUS_META[c.status].color" dot>{{ CAMPAIGN_STATUS_META[c.status].label }}</SlbBadge>
          <SlbDropdown :items="menu(c)" placement="bottom-end" @select="onMenu(c, $event)" @click.stop>
            <SlbButton variant="ghost" size="sm" icon-only icon-left="menu_dots_h" :aria-label="`${c.name} actions`" />
          </SlbDropdown>
        </header>

        <dl class="mk-card__facts">
          <dt>Executor</dt>
          <dd>
            <SlbIcon :name="c.executor.kind === ExecutorKind.AGENT ? 'ai_agent' : 'dev_nodes'" :size="12" />
            {{ c.executor.name }}
          </dd>
          <dt>Targets</dt>
          <dd>{{ c.targetList }}</dd>
          <dt>Schedule</dt>
          <dd>{{ c.schedule }}</dd>
          <dt>Limits</dt>
          <dd>{{ c.limits }} · {{ c.accounts }} accounts</dd>
        </dl>

        <dl class="mk-card__stats">
          <div><dt>Targets</dt><dd>{{ c.stats.targets.toLocaleString() }}</dd></div>
          <div><dt>Actions</dt><dd>{{ c.stats.actions.toLocaleString() }}</dd></div>
          <div><dt>Clicks</dt><dd>{{ c.stats.clicks.toLocaleString() }}</dd></div>
          <div><dt>Leads</dt><dd>{{ c.stats.leads.toLocaleString() }}</dd></div>
        </dl>

        <footer class="mk-card__foot">
          <span class="mk-cell__main">
            <PlatformIcon :platform="c.platform" />
            Updated {{ c.updatedAt }}
          </span>
          <span v-if="c.stats.blocked" class="mk-card__warn">
            <SlbIcon name="status_warning" :size="12" /> {{ c.stats.blocked }} blocks
          </span>
        </footer>
      </article>
    </div>

    <h2 class="mk-page__section-title">To research before building</h2>
    <div class="mk-ideas">
      <div v-for="idea in ROADMAP_IDEAS" :key="idea.title" class="mk-ideas__item">
        <h3>{{ idea.title }}</h3>
        <p>{{ idea.text }}</p>
      </div>
    </div>

    <component :is="DRAWERS[drawerType]" :key="drawerKey" v-model="drawerOpen" :campaign="drawerCampaign" />

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './marketing.scss';
</style>
