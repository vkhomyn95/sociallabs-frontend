<script setup lang="ts">
import { computed, reactive } from 'vue'
import { SlbBadge, SlbButton, SlbIcon, SlbInput, SlbProgress, SlbRadioGroup, SlbSelect, SlbTable, SlbToggle } from '@sociallabs/frontend-components'
import type { RadioOption, SelectOption, TableColumn } from '@sociallabs/frontend-components'
import StatTile from '@/components/stats/StatTile.vue'
import {
  AUDIENCE_SOURCE_META,
  BROADCAST_PROGRESS,
  BROADCAST_RECIPIENTS,
  BROADCAST_TEMPLATE,
  MESSAGE_VARIABLES,
  RECIPIENT_STATUS_META,
} from '../marketing.mock'
import { AudienceSource } from '../marketing.types'
import type { BroadcastRecipient, Campaign } from '../marketing.types'
import CampaignDrawerShell from './CampaignDrawerShell.vue'
import ChipListInput from './ChipListInput.vue'
import SendingSection from './SendingSection.vue'
import { REPLY_OPTIONS } from './options'
import { defaultSending } from './sending'

/**
 * Макет розсилки в особисті: кладемо в кампанію канали / групи → беремо їх учасників →
 * по черзі пишемо кожному в директ із ротацією акаунтів і лімітами. Відповіді йдуть у Dialogs,
 * де їх підхоплює агент або воркфлоу. `campaign` = null — нова кампанія.
 */
const props = defineProps<{ campaign: Campaign | null }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({
  name: props.campaign?.name ?? '',
  source: AudienceSource.GROUP_MEMBERS as string,
  sources: ['@growth_chat', '@marketing_ua_chat'],
  activeWithinDays: '30',
  onlyWithUsername: true,
  skipBots: true,
  skipAdmins: true,
  skipContacted: true,
  skipExistingDialogs: true,
  message: BROADCAST_TEMPLATE,
  aiPersonalize: false,
  followUp: true,
  followUpHours: '24',
  onReply: 'agent',
  sending: defaultSending('30'),
})

const sourceOptions: RadioOption[] = Object.values(AudienceSource).map((s) => ({
  value: s,
  label: AUDIENCE_SOURCE_META[s].label,
  description: AUDIENCE_SOURCE_META[s].hint,
}))
const replyOptions: SelectOption[] = REPLY_OPTIONS

const insertVariable = (v: string): void => {
  form.message += v
}

/** Груба оцінка: скільки днів піде на розсилку при заданих лімітах. */
const estimate = computed(() => {
  const accounts = form.sending.accounts.filter((a) => a.on).length
  const perDay = accounts * (Number(form.sending.perAccountDay) || 0)
  const audience = 1_736 // mock: знайдено після фільтрів
  return { accounts, perDay, audience, days: perDay ? Math.ceil(audience / perDay) : '∞' }
})

/** Превʼю: підставляємо змінні і беремо перший варіант зі spintax. */
const preview = computed(() =>
  form.message
    .replace(/\{([^{}]*\|[^{}]*)\}/g, (_, opts: string) => opts.split('|')[0] ?? '')
    .replace('{first_name}', 'Oksana')
    .replace('{username}', '@oksana_mkt')
    .replace('{source_chat}', form.sources[0] ?? '@growth_chat')
    .replace('{link}', 'sl.link/dm-web'),
)

const p = BROADCAST_PROGRESS
const done = p.sent + p.privacy + p.limited
const columns: TableColumn<BroadcastRecipient>[] = [
  { key: 'name', label: 'Recipient', minWidth: '170px' },
  { key: 'account', label: 'From account', width: '140px' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'at', label: 'When', width: '120px' },
]
</script>

<template>
  <CampaignDrawerShell
    v-model="open"
    v-model:name="form.name"
    :is-new="!campaign"
    new-title="New broadcast"
    :campaign-name="campaign?.name"
    activity-label="Queue"
    activity-icon="menu_list"
    :activity-badge="p.total"
    start-label="Collect audience & start"
  >
    <template #setup>
      <div class="mk-form__group">
        <span class="mk-form__label">1 · Who receives it</span>
        <SlbRadioGroup
          :model-value="form.source"
          name="broadcast-source"
          :options="sourceOptions"
          variant="card"
          @update:model-value="form.source = String($event)"
        />
        <ChipListInput v-model="form.sources" placeholder="@channel, @group or t.me/… link" />
        <div class="mk-form__row">
          <SlbInput v-model="form.activeWithinDays" type="number" label="Seen online within, days" />
          <div />
        </div>
        <SlbToggle v-model="form.onlyWithUsername" label="Only users with a @username" />
        <SlbToggle v-model="form.skipBots" label="Skip bots" />
        <SlbToggle v-model="form.skipAdmins" label="Skip admins of the source chats" />
        <SlbToggle v-model="form.skipContacted" label="Skip people already messaged by any campaign" />
        <SlbToggle v-model="form.skipExistingDialogs" label="Skip people we already have a dialog with" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">2 · Message</span>
        <textarea v-model="form.message" class="mk-broadcast__message" rows="7" />
        <div class="mk-broadcast__vars">
          <span class="mk-form__hint">Insert:</span>
          <SlbButton v-for="v in MESSAGE_VARIABLES" :key="v" size="sm" variant="ghost" @click="insertVariable(v)">{{ v }}</SlbButton>
        </div>
        <p class="mk-form__hint">
          <code>{Привіт|Вітаю}</code> — spintax, each recipient gets a random variant, so messages are not identical.
          <code>{link}</code> — a tracking link of this campaign, the reply is attributed to it.
        </p>
        <SlbToggle v-model="form.aiPersonalize" label="AI rewrites each message for the recipient (name, bio, source chat)" />
        <div class="mk-broadcast__preview">
          <span class="mk-form__hint">Preview for @oksana_mkt</span>
          <p>{{ preview }}</p>
        </div>
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">3 · When they answer</span>
        <SlbSelect :model-value="form.onReply" label="Reply goes to" :options="replyOptions" @update:model-value="form.onReply = String($event)" />
        <SlbToggle v-model="form.followUp" label="Send one follow-up if there is no reply" />
        <SlbInput v-if="form.followUp" v-model="form.followUpHours" type="number" label="Follow-up after, hours" />
      </div>

      <SendingSection v-model="form.sending" :step="4" limit-label="New dialogs / account / day" />

      <div class="mk-broadcast__estimate">
        <SlbIcon name="status_info" :size="16" />
        <span>
          ≈ <b>{{ estimate.audience.toLocaleString() }}</b> recipients after filters ·
          <b>{{ estimate.accounts }}</b> accounts × {{ form.sending.perAccountDay }} = <b>{{ estimate.perDay }}</b> / day ·
          takes about <b>{{ estimate.days }}</b> days
        </span>
      </div>
    </template>

    <template #activity>
      <SlbProgress :value="done" :max="p.total - p.skipped" label="Processed" label-position="top" />
      <div class="mk-broadcast__tiles">
        <StatTile label="Sent" :value="p.sent" />
        <StatTile label="Read" :value="p.read" :hint="`${Math.round((p.read / p.sent) * 100)}%`" />
        <StatTile label="Replied" :value="p.replied" :hint="`${((p.replied / p.sent) * 100).toFixed(1)}%`" />
        <StatTile label="DMs closed" :value="p.privacy" />
        <StatTile label="Rate-limited" :value="p.limited" hint="retried later" />
        <StatTile label="Skipped" :value="p.skipped" hint="by filters" />
      </div>
      <SlbTable :columns="columns" :data="BROADCAST_RECIPIENTS" row-key="id" size="sm">
        <template #cell-name="{ row }">
          <span class="mk-cell__name">{{ row.name }}</span>
          <span class="mk-cell__sub">{{ row.username }} · from {{ row.source }}</span>
        </template>
        <template #cell-status="{ row }">
          <SlbBadge :color="RECIPIENT_STATUS_META[row.status].color" dot>{{ RECIPIENT_STATUS_META[row.status].label }}</SlbBadge>
        </template>
        <template #cell-at="{ row }"><span class="mk-cell__muted">{{ row.at }}</span></template>
      </SlbTable>
    </template>
  </CampaignDrawerShell>
</template>
