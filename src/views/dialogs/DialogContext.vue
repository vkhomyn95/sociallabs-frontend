<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbBadge, SlbButton, SlbIcon, SlbSelect, SlbTab, SlbToggle } from '@sociallabs/frontend-components'
import type { TabItem } from '@sociallabs/frontend-components'
import ChannelAvatar from './ChannelAvatar.vue'
import { AGENTS, EXEC_META, WORKFLOWS, accountById, channelById } from './dialogs.mock'
import type { Dialog } from './dialogs.mock'

const props = defineProps<{ dialog: Dialog }>()
const emit = defineEmits<{ takeOver: []; handBack: [] }>()

const tab = ref('info')
const workflowToRun = ref<string | null>(null)
const agent = ref<string | null>(props.dialog.agent ?? AGENTS[0]!)

const account = computed(() => accountById(props.dialog.accountId))
const channel = computed(() => channelById(account.value.channel))

const tabs = computed((): TabItem[] => [
  { key: 'info', label: 'Контакт' },
  { key: 'runs', label: 'Виконання', badge: props.dialog.executions.length || undefined },
  { key: 'ai', label: 'AI', icon: 'ai_sparkle' },
])

const aiOn = computed({
  get: () => props.dialog.handler === 'ai',
  set: (on: boolean) => (on ? emit('handBack') : emit('takeOver')),
})

const sessionKey = computed(() => `${channel.value.id}:${account.value.id}:${props.dialog.contact.phone ?? props.dialog.contact.handle}`)
const toOptions = (list: string[]) => list.map((x) => ({ label: x, value: x }))
</script>

<template>
  <div class="dc">
    <div class="dc__contact">
      <ChannelAvatar :name="dialog.contact.name" :account-id="dialog.accountId" :group="dialog.isGroup" size="xl" />
      <div class="dc__name">{{ dialog.contact.name }}</div>
      <div class="dc__handle">{{ dialog.contact.handle }}</div>
      <div class="dc__quick">
        <SlbButton size="sm" variant="secondary" icon-left="chat_pin">{{ dialog.pinned ? 'Закріплено' : 'Закріпити' }}</SlbButton>
        <SlbButton size="sm" variant="secondary" :icon-left="dialog.muted ? 'object_bell_off' : 'object_bell'">{{ dialog.muted ? 'Без звуку' : 'Звук' }}</SlbButton>
      </div>
    </div>

    <SlbTab v-model="tab" :tabs="tabs" variant="line" />

    <div v-if="tab === 'info'" class="dc__section">
      <dl class="dc__fields">
        <dt>Канал</dt>
        <dd><SlbIcon :name="channel.icon" :size="14" :color="channel.color" /> {{ channel.label }}</dd>
        <dt>Акаунт</dt>
        <dd>
          {{ account.kind === 'bot' ? account.name : account.handle }}
          <SlbBadge size="sm" :color="account.kind === 'bot' ? 'gray' : 'primary'">{{ account.kind === 'bot' ? 'бот' : 'особистий' }}</SlbBadge>
        </dd>
        <template v-if="dialog.contact.phone">
          <dt>Телефон</dt>
          <dd>{{ dialog.contact.phone }}</dd>
        </template>
        <dt>Обробляє</dt>
        <dd>{{ dialog.handler === 'ai' ? `AI · ${dialog.agent}` : dialog.handler === 'workflow' ? `Workflow · ${dialog.workflow}` : dialog.handler === 'operator' ? 'Оператор' : '—' }}</dd>
      </dl>

      <div class="dc__label">Теги</div>
      <div class="dc__tags">
        <SlbBadge v-for="t in dialog.tags" :key="t" color="gray" size="md">{{ t }}</SlbBadge>
        <button type="button" class="dc__add"><SlbIcon name="action_plus" :size="12" /> тег</button>
      </div>

      <div class="dc__label">Нотатка</div>
      <textarea class="dc__note" rows="3" placeholder="Видно лише команді, не клієнту" />
    </div>

    <div v-else-if="tab === 'runs'" class="dc__section">
      <ul v-if="dialog.executions.length" class="dc__runs">
        <li v-for="e in dialog.executions" :key="e.id" class="dc__run">
          <div class="dc__run-top">
            <SlbIcon name="dev_nodes" :size="16" />
            <span class="dc__run-name">{{ e.workflow }}</span>
            <SlbBadge :color="EXEC_META[e.status].color" size="sm" dot>{{ EXEC_META[e.status].label }}</SlbBadge>
          </div>
          <div class="dc__run-meta">
            <span>{{ e.id }} · {{ e.startedAt }} · {{ e.duration }}</span>
            <a href="#" @click.prevent>Відкрити <SlbIcon name="action_external" :size="12" /></a>
          </div>
        </li>
      </ul>
      <p v-else class="dc__empty">Workflow ще не запускались для цього діалогу.</p>

      <div class="dc__label">Запустити workflow для діалогу</div>
      <div class="dc__run-form">
        <SlbSelect v-model="workflowToRun" :options="toOptions(WORKFLOWS)" placeholder="Оберіть workflow" size="sm" />
        <SlbButton size="sm" icon-left="media_play" :disabled="!workflowToRun">Запустити</SlbButton>
      </div>
    </div>

    <div v-else class="dc__section">
      <div class="dc__ai-card">
        <SlbToggle v-model="aiOn">Автовідповіді AI в цьому діалозі</SlbToggle>
        <SlbSelect v-model="agent" :options="toOptions(AGENTS)" label="Агент" size="sm" />
      </div>
      <dl class="dc__fields">
        <dt>Модель</dt>
        <dd>claude-sonnet-5-5</dd>
        <dt>Пам'ять</dt>
        <dd>База даних · останні 20 повідомлень</dd>
        <dt>Сесія</dt>
        <dd><code class="dc__code">{{ sessionKey }}</code></dd>
        <dt>Інструменти</dt>
        <dd class="dc__tools">
          <SlbBadge size="sm" color="violet">search_knowledge_base</SlbBadge>
          <SlbBadge size="sm" color="violet">billing_lookup</SlbBadge>
          <SlbBadge size="sm" color="violet">handoff_to_human</SlbBadge>
        </dd>
        <dt>Токени</dt>
        <dd>12 480 за сьогодні</dd>
      </dl>
      <SlbButton size="sm" variant="ghost" icon-left="action_trash" full>Очистити пам'ять AI для контакту</SlbButton>
    </div>
  </div>
</template>

<style scoped>
.dc { display: flex; flex-direction: column; gap: var(--slb-space-base); }
.dc__contact { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px; padding-top: var(--slb-space-sm); }
.dc__name { margin-top: var(--slb-space-sm); font-weight: var(--slb-fw-semibold); font-size: var(--slb-font-md); }
.dc__handle { font-size: var(--slb-font-sm); color: var(--slb-color-text-muted); }
.dc__quick { display: flex; gap: var(--slb-space-xs); margin-top: var(--slb-space-sm); }
.dc__section { display: flex; flex-direction: column; gap: var(--slb-space-sm); }
.dc__fields { display: grid; grid-template-columns: 96px 1fr; gap: var(--slb-space-sm) var(--slb-space-sm); margin: 0; font-size: var(--slb-font-sm); }
.dc__fields dt { color: var(--slb-color-text-muted); }
.dc__fields dd { margin: 0; display: flex; align-items: center; flex-wrap: wrap; gap: var(--slb-space-xs); min-width: 0; }
.dc__label { margin-top: var(--slb-space-sm); font-size: var(--slb-font-xs); font-weight: var(--slb-fw-medium); color: var(--slb-color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.dc__tags { display: flex; flex-wrap: wrap; gap: var(--slb-space-xs); }
.dc__add { display: inline-flex; align-items: center; gap: 2px; border: 1px dashed var(--slb-color-border); background: none; border-radius: var(--slb-radius-full); padding: 1px var(--slb-space-sm); font: inherit; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); cursor: pointer; }
.dc__note { width: 100%; resize: vertical; font: inherit; font-size: var(--slb-font-sm); padding: var(--slb-space-sm); border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-md); background: var(--slb-color-warning-light); }
.dc__runs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--slb-space-sm); }
.dc__run { border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-md); padding: var(--slb-space-sm); }
.dc__run-top { display: flex; align-items: center; gap: var(--slb-space-xs); }
.dc__run-top > :first-child { color: var(--slb-color-blue); }
.dc__run-name { flex: 1; font-weight: var(--slb-fw-medium); font-size: var(--slb-font-sm); }
.dc__run-meta { display: flex; justify-content: space-between; margin-top: 4px; font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); }
.dc__run-meta a { color: var(--slb-color-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 2px; }
.dc__run-form { display: flex; gap: var(--slb-space-xs); align-items: flex-start; }
.dc__run-form > :first-child { flex: 1; }
.dc__empty { margin: 0; font-size: var(--slb-font-sm); color: var(--slb-color-text-muted); }
.dc__ai-card { display: flex; flex-direction: column; gap: var(--slb-space-sm); padding: var(--slb-space-sm); border-radius: var(--slb-radius-md); background: color-mix(in srgb, var(--slb-color-violet) 7%, white); border: 1px solid color-mix(in srgb, var(--slb-color-violet) 20%, white); }
.dc__code { font-family: ui-monospace, monospace; font-size: var(--slb-font-xs); background: var(--slb-color-gray-100); padding: 1px 4px; border-radius: var(--slb-radius-sm); word-break: break-all; }
.dc__tools { gap: 4px; }
</style>
