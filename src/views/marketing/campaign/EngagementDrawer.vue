<script setup lang="ts">
import { reactive } from 'vue'
import { SlbBadge, SlbIcon, SlbInput, SlbRadioGroup, SlbSelect, SlbTable, SlbToggle } from '@sociallabs/frontend-components'
import type { RadioOption, TableColumn } from '@sociallabs/frontend-components'
import StatTile from '@/components/stats/StatTile.vue'
import { AUDIENCE_SOURCE_META, ENGAGEMENT_ACTION_META, ENGAGEMENT_LOG, ENGAGEMENT_PROGRESS } from '../marketing.mock'
import { AudienceSource, EngagementAction } from '../marketing.types'
import type { Campaign, EngagementLogEntry } from '../marketing.types'
import CampaignDrawerShell from './CampaignDrawerShell.vue'
import ChipListInput from './ChipListInput.vue'
import SendingSection from './SendingSection.vue'
import { REPLY_OPTIONS } from './options'
import { defaultSending } from './sending'

/**
 * Макет «engagement»: дешеві дії, які показують наш акаунт людям без жодного тексту —
 * перегляд сторіс (масслукінг), реакції, вступ у чати, підписки. Людина бачить акаунт
 * серед глядачів → відкриває профіль → біо з посиланням або пише сама.
 */
const props = defineProps<{ campaign: Campaign | null }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({
  name: props.campaign?.name ?? '',
  actions: Object.values(EngagementAction).map((a) => ({
    action: a,
    on: a === EngagementAction.STORY_VIEW || a === EngagementAction.STORY_REACTION || a === EngagementAction.REACTION,
  })),
  reactions: ['🔥', '👍', '❤️'],
  storyReactionPercent: '20',
  source: AudienceSource.CHANNEL_COMMENTERS as string,
  sources: ['@growth_chat', '@competitor_chat'],
  channels: ['@crypto_news_ua'],
  repeatDays: '7',
  onReply: 'agent',
  sending: defaultSending('500', '5', '40'),
})

const isOn = (a: EngagementAction): boolean => form.actions.some((x) => x.action === a && x.on)

const sourceOptions: RadioOption[] = Object.values(AudienceSource).map((s) => ({
  value: s,
  label: AUDIENCE_SOURCE_META[s].label,
  description: AUDIENCE_SOURCE_META[s].hint,
}))

const p = ENGAGEMENT_PROGRESS
const columns: TableColumn<EngagementLogEntry>[] = [
  { key: 'action', label: 'Action', width: '170px' },
  { key: 'target', label: 'Target', minWidth: '200px' },
  { key: 'account', label: 'Account', width: '140px' },
  { key: 'at', label: 'At', width: '64px' },
]
</script>

<template>
  <CampaignDrawerShell
    v-model="open"
    v-model:name="form.name"
    :is-new="!campaign"
    new-title="New engagement campaign"
    :campaign-name="campaign?.name"
    activity-label="Actions"
    activity-icon="chat_thumbs_up"
    :activity-badge="p.actions"
    start-label="Start"
  >
    <template #setup>
      <div class="mk-form__group">
        <span class="mk-form__label">1 · What to do</span>
        <div v-for="a in form.actions" :key="a.action" class="mk-broadcast__action">
          <SlbIcon :name="ENGAGEMENT_ACTION_META[a.action].icon" :size="16" />
          <span>
            <span class="mk-cell__name">{{ ENGAGEMENT_ACTION_META[a.action].label }}</span>
            <span class="mk-cell__sub">{{ ENGAGEMENT_ACTION_META[a.action].hint }}</span>
          </span>
          <SlbToggle v-model="a.on" :aria-label="ENGAGEMENT_ACTION_META[a.action].label" />
        </div>
        <template v-if="isOn(EngagementAction.REACTION) || isOn(EngagementAction.STORY_REACTION)">
          <span class="mk-form__hint">Reactions to pick from at random:</span>
          <ChipListInput v-model="form.reactions" placeholder="🔥" />
        </template>
        <SlbInput
          v-if="isOn(EngagementAction.STORY_REACTION)"
          v-model="form.storyReactionPercent"
          type="number"
          label="React on, % of viewed stories"
        />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">2 · On whom</span>
        <SlbRadioGroup :model-value="form.source" name="en-source" :options="sourceOptions" variant="card" @update:model-value="form.source = String($event)" />
        <ChipListInput v-model="form.sources" placeholder="@chat or @channel" />
        <template v-if="isOn(EngagementAction.REACTION)">
          <span class="mk-form__hint">Channels whose new posts get reactions:</span>
          <ChipListInput v-model="form.channels" placeholder="@channel" />
        </template>
        <SlbInput v-model="form.repeatDays" type="number" label="Same person again not earlier than, days" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">3 · When they come</span>
        <p class="mk-form__hint">
          The goal is a profile visit. Make sure the accounts have a real avatar, a bio with a tracking link,
          and some posts or stories of their own.
        </p>
        <SlbSelect :model-value="form.onReply" label="When someone writes to the account" :options="REPLY_OPTIONS" @update:model-value="form.onReply = String($event)" />
      </div>

      <SendingSection v-model="form.sending" :step="4" limit-label="Actions / account / day" />
    </template>

    <template #activity>
      <div class="mk-broadcast__tiles">
        <StatTile label="Actions" :value="p.actions" />
        <StatTile label="People reached" :value="p.reach" />
        <StatTile label="Profile visits" :value="p.profileVisits" :hint="`${((p.profileVisits / p.reach) * 100).toFixed(1)}%`" />
        <StatTile label="Followed back" :value="p.followsBack" />
        <StatTile label="Wrote to us" :value="p.newDialogs" />
        <StatTile label="Leads" :value="campaign?.stats.leads ?? 0" />
      </div>
      <SlbTable :columns="columns" :data="ENGAGEMENT_LOG" row-key="id" size="sm">
        <template #cell-action="{ row }">
          <span class="mk-cell__main">
            <SlbIcon :name="ENGAGEMENT_ACTION_META[row.action].icon" :size="14" />
            {{ ENGAGEMENT_ACTION_META[row.action].label }}
          </span>
        </template>
        <template #cell-account="{ row }"><SlbBadge color="gray" size="sm">{{ row.account }}</SlbBadge></template>
        <template #cell-at="{ row }"><span class="mk-cell__muted">{{ row.at }}</span></template>
      </SlbTable>
    </template>
  </CampaignDrawerShell>
</template>
