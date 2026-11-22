<script setup lang="ts">
import { reactive } from 'vue'
import { SlbBadge, SlbButton, SlbInput, SlbRadioGroup, SlbSelect, SlbTable, SlbToggle } from '@sociallabs/frontend-components'
import type { RadioOption, TableColumn } from '@sociallabs/frontend-components'
import StatTile from '@/components/stats/StatTile.vue'
import { POST_LOG, POST_PROGRESS, POST_STATUS_META, POST_VARIANTS } from '../marketing.mock'
import type { Campaign, PostLogEntry } from '../marketing.types'
import CampaignDrawerShell from './CampaignDrawerShell.vue'
import ChipListInput from './ChipListInput.vue'
import SendingSection from './SendingSection.vue'
import { TARGET_LIST_OPTIONS } from './options'
import { defaultSending } from './sending'

/**
 * Макет рекламних постів за розкладом: у свої канали (акаунт — адмін) або в групи, де постити дозволено.
 * Кілька варіантів тексту чергуються; посилання — окреме трекінгове на кожен чат, щоб бачити, який чат дав лідів.
 */
const props = defineProps<{ campaign: Campaign | null }>()
const open = defineModel<boolean>({ required: true })

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const form = reactive({
  name: props.campaign?.name ?? '',
  where: 'groups',
  targetList: 'marketing',
  chats: ['@marketing_ua_chat', '@smm_freelance', '@biz_lviv'],
  variants: POST_VARIANTS.map((v) => ({ ...v })),
  media: true,
  perChatLink: true,
  days: ['Mon', 'Thu'],
  times: '10:00',
  cooldownHours: '72',
  deletePrevious: true,
  respectSlowMode: true,
  respectRules: true,
  pinOwn: false,
  sending: defaultSending('20', '60', '240'),
})

const whereOptions: RadioOption[] = [
  { value: 'own', label: 'Own channels', description: 'The account is an admin — no limits from chat rules' },
  { value: 'groups', label: 'Groups that allow posting', description: 'Chats from Targets where members can post; rules and slow mode apply' },
  { value: 'list', label: 'A list from Targets', description: 'Any approved list, filtered to chats where we can write' },
]

const toggleDay = (d: string): void => {
  form.days = form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d]
}
const addVariant = (): void => {
  form.variants.push({ id: `v${form.variants.length + 1}`, name: `Variant ${String.fromCharCode(65 + form.variants.length)}`, text: '' })
}

const p = POST_PROGRESS
const columns: TableColumn<PostLogEntry>[] = [
  { key: 'chat', label: 'Chat', minWidth: '200px' },
  { key: 'status', label: 'Status', width: '140px' },
  { key: 'views', label: 'Views', width: '80px', align: 'right' },
  { key: 'clicks', label: 'Clicks', width: '70px', align: 'right' },
  { key: 'at', label: 'At', width: '90px' },
]
</script>

<template>
  <CampaignDrawerShell
    v-model="open"
    v-model:name="form.name"
    :is-new="!campaign"
    new-title="New posting campaign"
    :campaign-name="campaign?.name"
    activity-label="Posts"
    activity-icon="chat_broadcast"
    :activity-badge="p.posts"
    start-label="Schedule posts"
  >
    <template #setup>
      <div class="mk-form__group">
        <span class="mk-form__label">1 · Where to post</span>
        <SlbRadioGroup :model-value="form.where" name="ps-where" :options="whereOptions" variant="card" @update:model-value="form.where = String($event)" />
        <SlbSelect
          v-if="form.where === 'list'"
          :model-value="form.targetList"
          label="Target list"
          :options="TARGET_LIST_OPTIONS"
          @update:model-value="form.targetList = String($event)"
        />
        <ChipListInput v-else v-model="form.chats" placeholder="@channel or @group" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">2 · Post</span>
        <div v-for="v in form.variants" :key="v.id" class="mk-broadcast__variant">
          <SlbInput v-model="v.name" size="sm" />
          <textarea v-model="v.text" class="mk-broadcast__message" rows="4" placeholder="Post text, {link} for the tracking link" />
        </div>
        <SlbButton size="sm" variant="ghost" icon-left="action_plus" @click="addVariant">Add variant</SlbButton>
        <p class="mk-form__hint">Variants rotate between chats and runs — the same text everywhere gets flagged as spam.</p>
        <SlbToggle v-model="form.media" label="Attach image (1 file · creative.jpg)" />
        <SlbToggle v-model="form.perChatLink" label="Separate tracking link for every chat" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">3 · Schedule</span>
        <div class="mk-broadcast__days">
          <SlbButton
            v-for="d in DAYS"
            :key="d"
            size="sm"
            :variant="form.days.includes(d) ? 'primary' : 'secondary'"
            @click="toggleDay(d)"
          >
            {{ d }}
          </SlbButton>
        </div>
        <div class="mk-form__row">
          <SlbInput v-model="form.times" label="Time(s)" placeholder="10:00, 18:30" />
          <SlbInput v-model="form.cooldownHours" type="number" label="Not more often per chat, h" />
        </div>
        <SlbToggle v-model="form.deletePrevious" label="Delete our previous post in the chat before posting a new one" />
        <SlbToggle v-model="form.respectSlowMode" label="Respect slow mode — wait instead of failing" />
        <SlbToggle v-model="form.respectRules" label="AI reads pinned chat rules and skips chats that forbid ads" />
        <SlbToggle v-model="form.pinOwn" label="Pin the post in own channels" />
      </div>

      <SendingSection v-model="form.sending" :step="4" limit-label="Posts / account / day" />
    </template>

    <template #activity>
      <div class="mk-broadcast__tiles">
        <StatTile label="Chats" :value="p.chats" />
        <StatTile label="Posts" :value="p.posts" />
        <StatTile label="Views" :value="p.views" />
        <StatTile label="Clicks" :value="p.clicks" :hint="`${((p.clicks / p.views) * 100).toFixed(1)}% CTR`" />
        <StatTile label="Deleted by admins" :value="p.deleted" />
        <StatTile label="Leads" :value="campaign?.stats.leads ?? 0" />
      </div>
      <SlbTable :columns="columns" :data="POST_LOG" row-key="id" size="sm">
        <template #cell-chat="{ row }">
          <span class="mk-cell__name">{{ row.chat }}</span>
          <span class="mk-cell__sub">Variant {{ row.variant }} · as {{ row.account }}</span>
          <span v-if="row.note" class="mk-cell__error">{{ row.note }}</span>
        </template>
        <template #cell-status="{ row }">
          <SlbBadge :color="POST_STATUS_META[row.status].color" dot>{{ POST_STATUS_META[row.status].label }}</SlbBadge>
        </template>
        <template #cell-views="{ row }"><span class="mk-cell__num">{{ row.views.toLocaleString() }}</span></template>
        <template #cell-clicks="{ row }"><span class="mk-cell__num">{{ row.clicks }}</span></template>
        <template #cell-at="{ row }"><span class="mk-cell__muted">{{ row.at }}</span></template>
      </SlbTable>
    </template>
  </CampaignDrawerShell>
</template>
