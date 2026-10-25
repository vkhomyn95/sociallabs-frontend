<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { SlbBadge, SlbButton, SlbDropdown, SlbIcon, SlbToggle, SlbTooltip } from '@sociallabs/frontend-components'
import type { MenuItem } from '@sociallabs/frontend-components'
import ChannelAvatar from './ChannelAvatar.vue'
import { HANDLER_META, SNOOZE_OPTIONS, accountById, channelById } from './dialogs.mock'
import type { Dialog, Message } from './dialogs.mock'

const props = defineProps<{ dialog: Dialog; contextOpen: boolean }>()
const emit = defineEmits<{
  send: [text: string]
  takeOver: []
  handBack: []
  action: [key: string]
  'toggle-context': []
  'wake-up': []
}>()

const draft = ref('')
const scroller = ref<HTMLElement | null>(null)

const account = computed(() => accountById(props.dialog.accountId))
const channel = computed(() => channelById(account.value.channel))
const meta = computed(() => HANDLER_META[props.dialog.handler])

const snoozeItems: MenuItem[] = SNOOZE_OPTIONS.map((o) => ({ key: `snooze:${o.key}`, label: o.label, description: o.until }))

// Chat actions = shim/bot commands that already exist (pin, mute, mark unread, snooze, clear).
const moreItems = computed((): MenuItem[] => [
  { key: 'pin', label: props.dialog.pinned ? 'Відкріпити' : 'Закріпити', icon: 'chat_pin' },
  { key: 'mute', label: props.dialog.muted ? 'Увімкнути сповіщення' : 'Вимкнути сповіщення', icon: props.dialog.muted ? 'object_bell' : 'object_bell_off' },
  { key: 'unread', label: 'Позначити непрочитаним', icon: 'chat_bubble' },
  props.dialog.folder === 'snoozed'
    ? { key: 'unsnooze', label: 'Повернути зараз', icon: 'action_undo' }
    : { key: 'snooze', label: 'Відкласти', icon: 'object_clock', children: snoozeItems },
  props.dialog.folder === 'archived'
    ? { key: 'unarchive', label: 'Повернути з архіву', icon: 'action_undo' }
    : { key: 'archive', label: 'Архівувати', icon: 'chat_archive' },
  { key: 'workflow', label: 'Запустити workflow…', icon: 'dev_nodes' },
  { key: 'd', type: 'divider' },
  { key: 'clear', label: 'Очистити історію', icon: 'action_trash', danger: true },
])

const handlerTitle = computed(() => {
  const d = props.dialog
  if (d.handler === 'ai') return d.agent
  if (d.handler === 'workflow') return d.workflow
  if (d.handler === 'operator') return 'Ви'
  return 'Ніхто не обробляє'
})

const aiReplies = computed({
  get: () => props.dialog.handler === 'ai',
  set: (on: boolean) => (on ? emit('handBack') : emit('takeOver')),
})

const isOutgoing = (msg: Message): boolean => ['ai', 'workflow', 'operator'].includes(msg.author)

const STATUS_ICON = { sent: 'action_check', delivered: 'action_check_double', read: 'action_check_double' } as const

const suggest = (): void => {
  draft.value = 'Telegram підключається в розділі «Облікові дані» → Telegram Client, а Viber-номерів може бути кілька — кожен у своєму контейнері. Показати інструкцію?'
}

const send = (): void => {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text)
  draft.value = ''
}

const onKey = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

const scrollDown = async (): Promise<void> => {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight })
}
watch(() => [props.dialog.id, props.dialog.messages.length], scrollDown, { immediate: true })
</script>

<template>
  <section class="th">
    <header class="th__head">
      <ChannelAvatar :name="dialog.contact.name" :account-id="dialog.accountId" :group="dialog.isGroup" />
      <div class="th__who">
        <div class="th__name">{{ dialog.contact.name }}</div>
        <div class="th__sub">
          <span>{{ dialog.contact.handle }}</span>
          <span class="th__dot">·</span>
          <span :style="{ color: channel.color }">{{ channel.label }}</span>
          <span>{{ account.kind === 'bot' ? `бот ${account.name}` : `особистий ${account.handle}` }}</span>
        </div>
      </div>

      <div class="th__actions">
        <SlbTooltip :content="`Діалог веде: ${meta.label}`"><SlbBadge :color="meta.color" size="md" :prefix-icon="meta.icon">{{ handlerTitle }}</SlbBadge></SlbTooltip>
        <SlbButton v-if="dialog.handler === 'ai' || dialog.handler === 'workflow'" size="sm" variant="secondary" icon-left="chat_operator" @click="emit('takeOver')">
          Перехопити
        </SlbButton>
        <SlbButton v-else-if="dialog.agent" size="sm" variant="secondary" icon-left="ai_sparkle" @click="emit('handBack')">
          Повернути AI
        </SlbButton>
        <SlbDropdown v-if="dialog.folder === 'inbox'" :items="snoozeItems" placement="bottom-end" @select="(i) => emit('action', i.key)">
          <SlbTooltip content="Відкласти"><SlbButton size="sm" variant="ghost" icon-only icon-left="object_clock" aria-label="Відкласти" /></SlbTooltip>
        </SlbDropdown>
        <SlbTooltip v-if="dialog.folder !== 'archived'" content="Архівувати">
          <SlbButton size="sm" variant="ghost" icon-only icon-left="chat_archive" aria-label="Архівувати" @click="emit('action', 'archive')" />
        </SlbTooltip>
        <SlbTooltip content="Пошук у діалозі">
          <SlbButton size="sm" variant="ghost" icon-only icon-left="action_search" aria-label="Пошук" />
        </SlbTooltip>
        <SlbDropdown :items="moreItems" placement="bottom-end" @select="(i) => emit('action', i.key)">
          <SlbButton size="sm" variant="ghost" icon-only icon-left="menu_dots" aria-label="Дії з чатом" />
        </SlbDropdown>
        <SlbTooltip :content="contextOpen ? 'Сховати деталі' : 'Деталі'">
          <SlbButton
            size="sm"
            :variant="contextOpen ? 'secondary' : 'ghost'"
            icon-only
            icon-left="menu_sidebar_right"
            aria-label="Деталі"
            @click="emit('toggle-context')"
          />
        </SlbTooltip>
      </div>
    </header>

    <div v-if="dialog.folder === 'snoozed'" class="th__banner th__banner--snooze">
      <SlbIcon name="object_clock" :size="18" />
      <span>
        Відкладено до <b>{{ dialog.snoozedUntil }}</b>
        <template v-if="dialog.snoozeNote"> · {{ dialog.snoozeNote }}</template>
      </span>
      <SlbTooltip content="Симуляція: таймер спрацював — діалог повертається у вхідні з нагадуванням">
        <SlbButton size="sm" variant="ghost" icon-left="object_bell" @click="emit('wake-up')">Настав час</SlbButton>
      </SlbTooltip>
      <SlbButton size="sm" variant="secondary" icon-left="action_undo" @click="emit('action', 'unsnooze')">Повернути зараз</SlbButton>
    </div>
    <div v-else-if="dialog.folder === 'archived'" class="th__banner th__banner--archive">
      <SlbIcon name="chat_archive" :size="18" />
      <span>Діалог в архіві з {{ dialog.archivedAt }}. Нове повідомлення від клієнта або ваша відповідь повернуть його у вхідні.</span>
      <SlbButton size="sm" variant="secondary" icon-left="action_undo" @click="emit('action', 'unarchive')">Повернути</SlbButton>
    </div>

    <div v-if="dialog.needsAttention" class="th__banner th__banner--warn">
      <SlbIcon name="status_warning" :size="18" />
      <span>{{ dialog.needsAttention }}</span>
      <SlbButton v-if="dialog.handler !== 'operator'" size="sm" variant="secondary" @click="emit('takeOver')">Взяти на себе</SlbButton>
    </div>

    <div ref="scroller" class="th__scroll">
      <div class="th__day"><span>Сьогодні</span></div>

      <template v-for="msg in dialog.messages" :key="msg.id">
        <div v-if="msg.author === 'system'" class="th__system">
          <SlbIcon name="status_info" :size="14" />
          <span>{{ msg.text }}</span>
          <a v-if="msg.link" href="#" class="th__link" @click.prevent>{{ msg.link }}</a>
          <span class="th__system-time">{{ msg.time }}</span>
        </div>

        <details v-else-if="msg.author === 'tool' && msg.tool" class="th__tool">
          <summary>
            <SlbIcon name="dev_plug" :size="14" />
            AI викликав інструмент <code>{{ msg.tool.name }}</code>
            <span class="th__tool-time">{{ msg.time }}</span>
          </summary>
          <div class="th__tool-body">
            <div><span class="th__tool-label">Вхід</span><code>{{ msg.tool.input }}</code></div>
            <div><span class="th__tool-label">Результат</span><code>{{ msg.tool.output }}</code></div>
          </div>
        </details>

        <div v-else class="th__msg" :class="[`th__msg--${msg.author}`, { 'th__msg--out': isOutgoing(msg) }]">
          <div class="th__bubble">
            <div v-if="msg.author === 'ai' || msg.author === 'workflow' || (dialog.isGroup && msg.author === 'contact')" class="th__by">
              <SlbIcon v-if="msg.author === 'ai' || msg.author === 'workflow'" :name="HANDLER_META[msg.author].icon" :size="12" />
              {{ msg.meta }}
            </div>
            <div class="th__text">{{ msg.text }}</div>
            <div class="th__foot">
              <span>{{ msg.time }}</span>
              <SlbIcon
                v-if="msg.status"
                :name="STATUS_ICON[msg.status]"
                :size="14"
                :class="{ 'th__read': msg.status === 'read' }"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <footer class="th__composer">
      <div v-if="dialog.handler === 'ai'" class="th__hint">
        <SlbIcon name="ai_sparkle" :size="14" />
        Відповідає AI-агент «{{ dialog.agent }}». Ваше повідомлення поставить AI на паузу в цьому діалозі.
      </div>
      <div v-else-if="dialog.handler === 'workflow'" class="th__hint">
        <SlbIcon name="dev_nodes" :size="14" />
        Діалог веде workflow «{{ dialog.workflow }}». Ручне повідомлення не зупиняє виконання.
      </div>

      <div class="th__box">
        <textarea
          v-model="draft"
          class="th__input"
          rows="2"
          :placeholder="`Повідомлення через ${channel.label} (${account.kind === 'bot' ? account.name : account.handle})`"
          @keydown="onKey"
        />
        <div class="th__tools">
          <SlbTooltip content="Файл"><SlbButton size="sm" variant="ghost" icon-only icon-left="chat_attach" aria-label="Файл" /></SlbTooltip>
          <SlbTooltip content="Емодзі"><SlbButton size="sm" variant="ghost" icon-only icon-left="chat_emoji" aria-label="Емодзі" /></SlbTooltip>
          <SlbTooltip content="Шаблони"><SlbButton size="sm" variant="ghost" icon-only icon-left="chat_template" aria-label="Шаблони" /></SlbTooltip>
          <SlbButton size="sm" variant="ghost" icon-left="ai_wand" @click="suggest">Чернетка від AI</SlbButton>
          <span class="th__spacer" />
          <SlbToggle v-if="dialog.agent" v-model="aiReplies" size="sm">AI-відповіді</SlbToggle>
          <SlbButton size="sm" icon-right="action_send" :disabled="!draft.trim()" @click="send">Надіслати</SlbButton>
        </div>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.th { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--slb-color-gray-50); min-height: 0; }

.th__head { display: flex; align-items: center; gap: var(--slb-space-sm); padding: var(--slb-space-sm) var(--slb-space-base); background: var(--slb-color-white); border-bottom: 1px solid var(--slb-color-border); min-height: 64px; }
.th__who { min-width: 0; flex: 1; }
.th__name { font-weight: var(--slb-fw-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.th__sub { display: flex; gap: var(--slb-space-xs); font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); white-space: nowrap; overflow: hidden; }
.th__dot { opacity: 0.6; }
.th__actions { display: flex; align-items: center; gap: var(--slb-space-xs); flex-shrink: 0; }

.th__banner { display: flex; align-items: center; gap: var(--slb-space-sm); padding: var(--slb-space-sm) var(--slb-space-base); font-size: var(--slb-font-sm); }
.th__banner > span { flex: 1; }
.th__banner--warn { background: var(--slb-color-warning-light); border-bottom: 1px solid var(--slb-color-warning-ring); }
.th__banner--warn > :first-child { color: var(--slb-color-warning); }
.th__banner--snooze { background: var(--slb-color-info-light); border-bottom: 1px solid var(--slb-color-info-ring); }
.th__banner--snooze > :first-child { color: var(--slb-color-info); }
.th__banner--archive { background: var(--slb-color-gray-100); border-bottom: 1px solid var(--slb-color-border); color: var(--slb-color-text-muted); }

.th__scroll { flex: 1; overflow-y: auto; padding: var(--slb-space-base) var(--slb-space-xl); display: flex; flex-direction: column; gap: var(--slb-space-sm); }
.th__day { text-align: center; margin: var(--slb-space-xs) 0; }
.th__day span { font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); background: var(--slb-color-white); border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-full); padding: 2px var(--slb-space-sm); }

.th__system { align-self: center; display: flex; align-items: center; gap: var(--slb-space-xs); max-width: 80%; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); background: var(--slb-color-gray-100); border-radius: var(--slb-radius-md); padding: var(--slb-space-xs) var(--slb-space-sm); }
.th__system-time { opacity: 0.7; }
.th__link { color: var(--slb-color-primary); font-weight: var(--slb-fw-medium); text-decoration: none; }

.th__tool { align-self: flex-end; max-width: 70%; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); border: 1px dashed var(--slb-color-border); border-radius: var(--slb-radius-md); background: var(--slb-color-white); }
.th__tool summary { display: flex; align-items: center; gap: var(--slb-space-xs); padding: var(--slb-space-xs) var(--slb-space-sm); cursor: pointer; list-style: none; }
.th__tool summary::-webkit-details-marker { display: none; }
.th__tool code { font-family: ui-monospace, monospace; color: var(--slb-color-violet); }
.th__tool-time { margin-left: auto; padding-left: var(--slb-space-sm); }
.th__tool-body { display: flex; flex-direction: column; gap: var(--slb-space-xs); padding: 0 var(--slb-space-sm) var(--slb-space-sm); }
.th__tool-body code { display: block; color: var(--slb-color-text); background: var(--slb-color-gray-50); padding: var(--slb-space-xs); border-radius: var(--slb-radius-sm); white-space: pre-wrap; }
.th__tool-label { display: block; font-weight: var(--slb-fw-medium); margin-bottom: 2px; }

.th__msg { display: flex; }
.th__msg--out { justify-content: flex-end; }
.th__bubble { max-width: min(560px, 75%); padding: var(--slb-space-sm) var(--slb-space-base); border-radius: var(--slb-radius-lg); background: var(--slb-color-white); border: 1px solid var(--slb-color-border); box-shadow: var(--slb-shadow-sm); }
.th__msg--contact .th__bubble { border-bottom-left-radius: var(--slb-radius-sm); }
.th__msg--out .th__bubble { border-bottom-right-radius: var(--slb-radius-sm); }
.th__msg--operator .th__bubble { background: var(--slb-color-primary); border-color: var(--slb-color-primary); color: var(--slb-color-white); }
.th__msg--ai .th__bubble { background: color-mix(in srgb, var(--slb-color-violet) 9%, white); border-color: color-mix(in srgb, var(--slb-color-violet) 25%, white); }
.th__msg--workflow .th__bubble { background: color-mix(in srgb, var(--slb-color-blue) 8%, white); border-color: color-mix(in srgb, var(--slb-color-blue) 22%, white); }
.th__by { display: flex; align-items: center; gap: 4px; font-size: var(--slb-font-xs); font-weight: var(--slb-fw-medium); margin-bottom: 2px; }
.th__msg--ai .th__by { color: var(--slb-color-violet); }
.th__msg--workflow .th__by { color: var(--slb-color-blue); }
.th__msg--contact .th__by { color: var(--slb-color-primary); }
.th__text { white-space: pre-wrap; line-height: 1.45; }
.th__foot { display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 2px; font-size: 11px; opacity: 0.65; }
.th__read { color: var(--slb-color-sky); opacity: 1; }
.th__msg--operator .th__read { color: var(--slb-color-white); }

.th__composer { padding: var(--slb-space-sm) var(--slb-space-base) var(--slb-space-base); background: var(--slb-color-white); border-top: 1px solid var(--slb-color-border); }
.th__hint { display: flex; align-items: center; gap: var(--slb-space-xs); font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); margin-bottom: var(--slb-space-xs); }
.th__hint :deep(.slb-icon) { color: var(--slb-color-violet); }
.th__box { border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-lg); transition: var(--slb-transition); }
.th__box:focus-within { border-color: var(--slb-color-primary); box-shadow: 0 0 0 3px var(--slb-color-primary-ring); }
.th__input { width: 100%; border: 0; resize: none; padding: var(--slb-space-sm) var(--slb-space-base) 0; font: inherit; color: inherit; background: transparent; outline: none; }
.th__tools { display: flex; align-items: center; gap: 2px; padding: var(--slb-space-xs); }
.th__spacer { flex: 1; }
.th__tools > :deep(.slb-toggle) { margin-right: var(--slb-space-sm); }
</style>
