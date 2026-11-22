<script setup lang="ts">
import { reactive } from 'vue'
import { SlbBadge, SlbIcon, SlbInput, SlbRadioGroup, SlbSelect, SlbTable, SlbToggle } from '@sociallabs/frontend-components'
import type { RadioOption, TableColumn } from '@sociallabs/frontend-components'
import StatTile from '@/components/stats/StatTile.vue'
import { COMMENT_LOG, COMMENT_PROGRESS, COMMENT_PROMPT, COMMENT_STATUS_META } from '../marketing.mock'
import { Platform } from '../marketing.types'
import type { Campaign, CommentLogEntry } from '../marketing.types'
import CampaignDrawerShell from './CampaignDrawerShell.vue'
import ChipListInput from './ChipListInput.vue'
import SendingSection from './SendingSection.vue'
import { AGENT_OPTIONS, PLATFORM_OPTIONS, REPLY_OPTIONS, TARGET_LIST_OPTIONS } from './options'
import { defaultSending } from './sending'

/**
 * Макет «нейрокоментингу»: слухаємо нові пости цільових каналів (або відео за хештегами в TikTok),
 * AI-агент читає пост і пише релевантний коментар від одного з акаунтів. Мета — не посилання в коментарі,
 * а інтерес до профілю (аватар + біо з посиланням). Відповіді під коментарем веде агент.
 */
const props = defineProps<{ campaign: Campaign | null }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({
  name: props.campaign?.name ?? '',
  platform: (props.campaign?.platform ?? Platform.TELEGRAM) as string,
  where: 'list',
  targetList: 'crypto',
  channels: ['@crypto_news_ua', '@trading_room'],
  keywords: [] as string[],
  skipAds: true,
  firstMinutes: '15',
  probability: '70',
  generator: 'ai',
  agent: 'commenter',
  prompt: COMMENT_PROMPT,
  templates: 'Цікава думка! А як це працює на практиці?\nДякую, збережу собі. Є досвід з цим?',
  linkPolicy: 'profile',
  replyToReplies: true,
  onReply: 'agent',
  checkDeleted: true,
  checkProfile: true,
  sending: defaultSending('25', '120', '900'),
})

const whereOptions: RadioOption[] = [
  { value: 'list', label: 'A list from Targets', description: 'Approved targets, kept fresh by the scraper' },
  { value: 'manual', label: 'Specific channels', description: 'Paste channels — the account must be able to comment there' },
]
const generatorOptions: RadioOption[] = [
  { value: 'ai', label: 'AI agent writes each comment', description: 'Reads the post and answers on topic, in the post language' },
  { value: 'templates', label: 'Templates in rotation', description: 'Cheaper, but identical comments get deleted faster' },
]
const linkOptions: RadioOption[] = [
  { value: 'profile', label: 'No link — profile does the work', description: 'Safest: people open the profile, the bio has the link' },
  { value: 'mention', label: 'Mention @channel or @bot', description: 'Visible call to action, admins delete it more often' },
  { value: 'link', label: 'Tracking link in the comment', description: 'Most clicks, highest risk of deletion and bans' },
]

const p = COMMENT_PROGRESS
const columns: TableColumn<CommentLogEntry>[] = [
  { key: 'comment', label: 'Comment', minWidth: '280px' },
  { key: 'status', label: 'Status', width: '140px' },
  { key: 'reactions', label: '♥', width: '50px', align: 'right' },
  { key: 'at', label: 'At', width: '64px' },
]
</script>

<template>
  <CampaignDrawerShell
    v-model="open"
    v-model:name="form.name"
    :is-new="!campaign"
    new-title="New commenting campaign"
    :campaign-name="campaign?.name"
    activity-label="Comments"
    activity-icon="chat_bubble_text"
    :activity-badge="p.comments"
    start-label="Start listening"
  >
    <template #setup>
      <div class="mk-form__group">
        <span class="mk-form__label">1 · Where to comment</span>
        <SlbSelect :model-value="form.platform" label="Platform" :options="PLATFORM_OPTIONS" @update:model-value="form.platform = String($event)" />
        <SlbRadioGroup :model-value="form.where" name="cm-where" :options="whereOptions" variant="card" @update:model-value="form.where = String($event)" />
        <SlbSelect
          v-if="form.where === 'list'"
          :model-value="form.targetList"
          label="Target list"
          :options="TARGET_LIST_OPTIONS"
          @update:model-value="form.targetList = String($event)"
        />
        <ChipListInput v-else v-model="form.channels" :placeholder="form.platform === Platform.TIKTOK ? '#hashtag or @author' : '@channel'" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">2 · Which posts</span>
        <span class="mk-form__hint">Only posts containing these words (empty — every new post):</span>
        <ChipListInput v-model="form.keywords" placeholder="біткоїн, ETF, трейдинг" />
        <div class="mk-form__row">
          <SlbInput v-model="form.firstMinutes" type="number" label="Comment within, min after publish" />
          <SlbInput v-model="form.probability" type="number" label="Comment on, % of posts" />
        </div>
        <p class="mk-form__hint">Early comments collect the most views. Skipping some posts looks less like a bot.</p>
        <SlbToggle v-model="form.skipAds" label="Skip ad posts (#реклама, «партнерський»)" />
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">3 · What to write</span>
        <SlbRadioGroup :model-value="form.generator" name="cm-gen" :options="generatorOptions" variant="card" @update:model-value="form.generator = String($event)" />
        <template v-if="form.generator === 'ai'">
          <SlbSelect :model-value="form.agent" label="Agent" :options="AGENT_OPTIONS" @update:model-value="form.agent = String($event)" />
          <span class="mk-form__hint">Instructions for the comment (added to the agent's prompt):</span>
          <textarea v-model="form.prompt" class="mk-broadcast__message" rows="6" />
        </template>
        <template v-else>
          <span class="mk-form__hint">One template per line, spintax supported:</span>
          <textarea v-model="form.templates" class="mk-broadcast__message" rows="4" />
        </template>
        <span class="mk-form__label">Link</span>
        <SlbRadioGroup :model-value="form.linkPolicy" name="cm-link" :options="linkOptions" @update:model-value="form.linkPolicy = String($event)" />
        <div class="mk-broadcast__preview">
          <span class="mk-form__hint">Example for «ETF на ефір схвалили — що далі для альтів?»</span>
          <p>{{ COMMENT_LOG[0]?.comment }}</p>
        </div>
      </div>

      <div class="mk-form__group">
        <span class="mk-form__label">4 · Replies & control</span>
        <SlbToggle v-model="form.replyToReplies" label="Agent answers replies under our comment" />
        <SlbSelect :model-value="form.onReply" label="When someone writes to the account in DM" :options="REPLY_OPTIONS" @update:model-value="form.onReply = String($event)" />
        <SlbToggle v-model="form.checkDeleted" label="Check after 1 h that the comment is still there — if deleted, mark the target «Blocked us»" />
        <SlbToggle v-model="form.checkProfile" label="Before start, check every account has an avatar and a bio with the link" />
      </div>

      <SendingSection v-model="form.sending" :step="5" limit-label="Comments / account / day" />
    </template>

    <template #activity>
      <div class="mk-broadcast__tiles">
        <StatTile label="New posts seen" :value="p.posts" />
        <StatTile label="Comments" :value="p.comments" />
        <StatTile label="Got replies" :value="p.replies" />
        <StatTile label="Deleted by admins" :value="p.deleted" :hint="`${((p.deleted / p.comments) * 100).toFixed(1)}%`" />
        <StatTile label="Profile visits" :value="p.profileVisits" />
        <StatTile label="Leads" :value="campaign?.stats.leads ?? 0" />
      </div>
      <SlbTable :columns="columns" :data="COMMENT_LOG" row-key="id" size="sm">
        <template #cell-comment="{ row }">
          <span class="mk-cell__sub">
            <SlbIcon name="chat_reply" :size="11" /> {{ row.target }} — «{{ row.post }}»
          </span>
          <span class="mk-broadcast__comment">{{ row.comment }}</span>
          <span class="mk-cell__sub">as {{ row.account }}</span>
        </template>
        <template #cell-status="{ row }">
          <SlbBadge :color="COMMENT_STATUS_META[row.status].color" dot>{{ COMMENT_STATUS_META[row.status].label }}</SlbBadge>
        </template>
        <template #cell-reactions="{ row }"><span class="mk-cell__num">{{ row.reactions }}</span></template>
        <template #cell-at="{ row }"><span class="mk-cell__muted">{{ row.at }}</span></template>
      </SlbTable>
    </template>
  </CampaignDrawerShell>
</template>
