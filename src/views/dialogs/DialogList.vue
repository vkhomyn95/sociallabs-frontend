<script setup lang="ts">
import { computed } from 'vue'
import { SlbButton, SlbBadge, SlbDropdown, SlbIcon, SlbInput, SlbTab, SlbTooltip } from '@sociallabs/frontend-components'
import type { MenuItem, TabItem } from '@sociallabs/frontend-components'
import ChannelAvatar from './ChannelAvatar.vue'
import { ACCOUNTS, CHANNELS, FOLDER_META, HANDLER_META, accountById, channelById } from './dialogs.mock'
import type { ChannelId, Dialog, Folder } from './dialogs.mock'

const props = defineProps<{ dialogs: Dialog[]; all: Dialog[]; selectedId: string | null }>()
const emit = defineEmits<{ select: [id: string]; create: [] }>()

const search = defineModel<string>('search', { required: true })
const accountId = defineModel<string>('account', { required: true })
const channel = defineModel<ChannelId | 'all'>('channel', { required: true })
const handler = defineModel<string>('handler', { required: true })
const attentionOnly = defineModel<boolean>('attention', { required: true })
const folder = defineModel<Folder>('folder', { required: true })

const folderTabs = computed((): TabItem[] => {
  const inbox = props.all.filter((d) => d.folder === 'inbox').reduce((n, d) => n + d.unread, 0)
  const snoozed = props.all.filter((d) => d.folder === 'snoozed').length
  return [
    { key: 'inbox', label: 'Вхідні', badge: inbox || undefined },
    { key: 'snoozed', label: 'Відкладені', icon: 'object_clock', badge: snoozed || undefined },
    { key: 'archived', label: 'Архів', icon: 'chat_archive' },
  ]
})

// Counters are per folder: the AI tab in Archive counts archived AI dialogs.
const count = (fn: (d: Dialog) => boolean): number => props.all.filter((d) => d.folder === folder.value && fn(d)).length

const handlerTabs = computed((): TabItem[] => [
  { key: 'all', label: 'Всі' },
  { key: 'ai', label: 'AI', icon: 'ai_sparkle', badge: count((d) => d.handler === 'ai') },
  { key: 'workflow', label: 'Workflow', icon: 'dev_nodes' },
  { key: 'operator', label: 'Мої', icon: 'object_user' },
])

const attentionCount = computed(() => count((d) => !!d.needsAttention))

// Accounts menu: grouped by channel; Instagram/Facebook shown as upcoming.
const accountItems = computed((): MenuItem[] => [
  { key: 'all', label: 'Всі акаунти', icon: 'object_inbox', checked: accountId.value === 'all' },
  ...CHANNELS.flatMap((c): MenuItem[] => {
    const accounts = ACCOUNTS.filter((a) => a.channel === c.id)
    if (!c.available) return [{ key: `soon-${c.id}`, label: `${c.label} — незабаром`, icon: c.icon, disabled: true }]
    return [
      { key: `g-${c.id}`, type: 'group', label: c.label },
      ...accounts.map((a): MenuItem => ({
        key: a.id,
        label: a.kind === 'bot' ? a.name : a.handle,
        description: `${a.kind === 'bot' ? 'Бот · ' + a.handle : 'Особистий акаунт'}${a.status === 'syncing' ? ' · синхронізація…' : ''}`,
        icon: c.icon,
        checked: accountId.value === a.id,
      })),
    ]
  }),
  { key: 'd', type: 'divider' },
  { key: 'connect', label: 'Підключити акаунт', icon: 'action_plus' },
])

const accountLabel = computed(() => {
  if (accountId.value === 'all') return 'Всі акаунти'
  const a = accountById(accountId.value)
  return `${channelById(a.channel).label} · ${a.kind === 'bot' ? a.name : a.handle}`
})

const onAccount = (item: MenuItem): void => {
  if (item.key === 'connect') return
  accountId.value = item.key
}

const preview = (d: Dialog): string => {
  // Prefer the last real message; system lines only when there is nothing else.
  const visible = d.messages.filter((x) => x.author !== 'tool')
  const last = [...visible].reverse().find((x) => x.author !== 'system') ?? visible[visible.length - 1]
  if (!last) return ''
  if (last.author === 'operator') return `Ви: ${last.text}`
  if (last.author === 'system') return last.text
  if (d.isGroup && last.meta) return `${last.meta}: ${last.text}`
  return last.text
}

const lastAuthorIcon = (d: Dialog) => {
  const last = [...d.messages].reverse().find((x) => x.author !== 'tool')
  if (last?.author === 'ai') return HANDLER_META.ai.icon
  if (last?.author === 'workflow') return HANDLER_META.workflow.icon
  return null
}

const accountCaption = (d: Dialog): string => {
  const a = accountById(d.accountId)
  return a.kind === 'bot' ? a.name : a.handle
}
</script>

<template>
  <section class="dl">
    <header class="dl__head">
      <div class="dl__title-row">
        <h1 class="dl__title">Діалоги</h1>
        <SlbButton size="sm" icon-left="chat_new" @click="emit('create')">Новий</SlbButton>
      </div>

      <SlbTab v-model="folder" :tabs="folderTabs" variant="line" class="dl__folders" />

      <SlbDropdown :items="accountItems" placement="bottom-start" match-width @select="onAccount">
        <button type="button" class="dl__account">
          <SlbIcon :name="accountId === 'all' ? 'object_inbox' : channelById(accountById(accountId).channel).icon" :size="16" />
          <span class="dl__account-label">{{ accountLabel }}</span>
          <SlbIcon name="arrow_down" :size="14" />
        </button>
      </SlbDropdown>

      <div class="dl__channels" role="group" aria-label="Канали">
        <button type="button" class="dl__chip" :class="{ 'dl__chip--on': channel === 'all' }" @click="channel = 'all'">Всі</button>
        <template v-for="c in CHANNELS" :key="c.id">
          <SlbTooltip :content="c.available ? c.label : `${c.label} — незабаром`">
            <button
              type="button"
              class="dl__chip dl__chip--icon"
              :class="{ 'dl__chip--on': channel === c.id }"
              :disabled="!c.available"
              :style="{ '--ch': c.color }"
              :aria-label="c.label"
              @click="channel = c.id"
            >
              <SlbIcon :name="c.icon" :size="16" />
            </button>
          </SlbTooltip>
        </template>
      </div>

      <SlbInput v-model="search" size="sm" icon-left="action_search" placeholder="Пошук за іменем, номером, текстом" clearable />

      <SlbTab v-model="handler" :tabs="handlerTabs" variant="segmented" />

      <button
        v-if="attentionCount"
        type="button"
        class="dl__attention"
        :class="{ 'dl__attention--on': attentionOnly }"
        @click="attentionOnly = !attentionOnly"
      >
        <SlbIcon name="status_warning" :size="16" />
        <span>Потребують уваги</span>
        <SlbBadge color="warning" size="sm">{{ attentionCount }}</SlbBadge>
        <SlbIcon v-if="attentionOnly" class="dl__attention-x" name="action_close" :size="14" />
      </button>
    </header>

    <ul class="dl__list" role="listbox" aria-label="Діалоги">
      <li v-for="d in dialogs" :key="d.id">
        <button
          type="button"
          class="dl__item"
          :class="{ 'dl__item--active': d.id === selectedId, 'dl__item--unread': d.unread > 0 }"
          role="option"
          :aria-selected="d.id === selectedId"
          @click="emit('select', d.id)"
        >
          <ChannelAvatar :name="d.contact.name" :account-id="d.accountId" :group="d.isGroup" />
          <span class="dl__body">
            <span class="dl__row">
              <span class="dl__name">{{ d.contact.name }}</span>
              <SlbIcon v-if="d.pinned" class="dl__meta-icon" name="chat_pin" :size="13" />
              <SlbIcon v-if="d.muted" class="dl__meta-icon" name="object_bell_off" :size="13" />
              <span v-if="d.folder === 'snoozed'" class="dl__time dl__time--snooze"><SlbIcon name="object_clock" :size="12" />{{ d.snoozedUntil }}</span>
              <span v-else class="dl__time">{{ d.lastAt }}</span>
            </span>
            <span class="dl__row">
              <SlbIcon v-if="lastAuthorIcon(d)" class="dl__author" :name="lastAuthorIcon(d)!" :size="13" />
              <span class="dl__preview">{{ preview(d) }}</span>
              <SlbBadge v-if="d.unread" :color="d.muted ? 'gray' : 'primary'" size="sm">{{ d.unread }}</SlbBadge>
            </span>
            <span v-if="d.folder === 'snoozed' && d.snoozeNote" class="dl__note">«{{ d.snoozeNote }}»</span>
            <span class="dl__row dl__row--tags">
              <SlbBadge v-if="d.needsAttention" color="warning" size="sm" prefix-icon="status_warning">Увага</SlbBadge>
              <SlbBadge v-else-if="d.handler !== 'none'" :color="HANDLER_META[d.handler].color" size="sm" :prefix-icon="HANDLER_META[d.handler].icon">
                {{ d.handler === 'ai' ? d.agent : d.handler === 'workflow' ? d.workflow : 'Оператор' }}
              </SlbBadge>
              <span class="dl__via"><SlbIcon v-if="accountById(d.accountId).kind === 'bot'" name="object_robot" :size="12" />{{ accountCaption(d) }}</span>
            </span>
          </span>
        </button>
      </li>
      <li v-if="!dialogs.length" class="dl__empty">
        <SlbIcon name="chat_bubble" :size="28" />
        <span>{{ FOLDER_META[folder].empty }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.dl { display: flex; flex-direction: column; width: 360px; flex-shrink: 0; border-right: 1px solid var(--slb-color-border); background: var(--slb-color-white); min-height: 0; }
.dl__head { display: flex; flex-direction: column; gap: var(--slb-space-sm); padding: var(--slb-space-base); border-bottom: 1px solid var(--slb-color-border); }
.dl__title-row { display: flex; align-items: center; justify-content: space-between; }
.dl__folders { margin: 0 calc(-1 * var(--slb-space-base)); padding: 0 var(--slb-space-sm); }
.dl__time--snooze { display: inline-flex; align-items: center; gap: 3px; color: var(--slb-color-info) !important; }
.dl__note { font-size: var(--slb-font-xs); color: var(--slb-color-info); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dl__title { display: flex; align-items: center; gap: var(--slb-space-sm); margin: 0; font-size: var(--slb-font-lg); font-weight: var(--slb-fw-semibold); }

.dl__account {
  display: flex; align-items: center; gap: var(--slb-space-sm); width: 100%;
  height: var(--slb-height-sm); padding: 0 var(--slb-space-sm);
  border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-md);
  background: var(--slb-color-white); color: var(--slb-color-text); font: inherit; font-size: var(--slb-font-sm); cursor: pointer;
}
.dl__account:hover { border-color: var(--slb-color-border-hover); }
.dl__account-label { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dl__channels { display: flex; gap: var(--slb-space-xs); }
.dl__chip {
  height: 30px; min-width: 30px; padding: 0 var(--slb-space-sm);
  border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-full);
  background: var(--slb-color-white); color: var(--slb-color-text-muted); font: inherit; font-size: var(--slb-font-sm); cursor: pointer;
  display: inline-grid; place-items: center;
}
.dl__chip--icon { color: var(--ch); padding: 0; }
.dl__chip:hover:not(:disabled) { border-color: var(--slb-color-border-hover); }
.dl__chip--on { background: var(--slb-color-primary-light); border-color: var(--slb-color-primary); color: var(--slb-color-primary); }
.dl__chip--icon.dl__chip--on { background: color-mix(in srgb, var(--ch) 12%, white); border-color: var(--ch); color: var(--ch); }
.dl__chip:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(1); }

.dl__attention {
  display: flex; align-items: center; gap: var(--slb-space-sm);
  padding: var(--slb-space-xs) var(--slb-space-sm); border-radius: var(--slb-radius-md);
  border: 1px solid var(--slb-color-warning-ring); background: var(--slb-color-warning-light);
  color: var(--slb-color-text); font: inherit; font-size: var(--slb-font-sm); cursor: pointer; text-align: left;
}
.dl__attention > span:first-of-type { flex: 1; }
.dl__attention :deep(.slb-icon:first-child) { color: var(--slb-color-warning); }
.dl__attention--on { border-color: var(--slb-color-warning); }

.dl__list { list-style: none; margin: 0; padding: var(--slb-space-xs); overflow-y: auto; flex: 1; }
.dl__item {
  display: flex; gap: var(--slb-space-sm); width: 100%; align-items: flex-start;
  padding: var(--slb-space-sm); border: 0; border-radius: var(--slb-radius-md);
  background: transparent; font: inherit; color: inherit; text-align: left; cursor: pointer;
}
.dl__item:hover { background: var(--slb-color-gray-50); }
.dl__item--active, .dl__item--active:hover { background: var(--slb-color-primary-light); }
.dl__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dl__row { display: flex; align-items: center; gap: var(--slb-space-xs); min-width: 0; }
.dl__row--tags { margin-top: 2px; }
.dl__name { font-weight: var(--slb-fw-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dl__item--unread .dl__name { font-weight: var(--slb-fw-semibold); }
.dl__meta-icon { color: var(--slb-color-text-muted); flex-shrink: 0; }
.dl__time { margin-left: auto; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); flex-shrink: 0; }
.dl__item--unread .dl__time { color: var(--slb-color-primary); }
.dl__author { color: var(--slb-color-violet); flex-shrink: 0; }
.dl__preview { flex: 1; min-width: 0; font-size: var(--slb-font-sm); color: var(--slb-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dl__item--unread .dl__preview { color: var(--slb-color-text); }
.dl__via { display: inline-flex; align-items: center; gap: 3px; min-width: 0; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dl__empty { display: flex; flex-direction: column; align-items: center; gap: var(--slb-space-sm); padding: var(--slb-space-2xl) var(--slb-space-base); color: var(--slb-color-text-muted); font-size: var(--slb-font-sm); }
</style>
