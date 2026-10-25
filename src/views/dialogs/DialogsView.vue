<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { SlbSheet, SlbToastProvider, slbToast } from '@sociallabs/frontend-components'
import DialogList from './DialogList.vue'
import DialogThread from './DialogThread.vue'
import DialogContext from './DialogContext.vue'
import NewDialogModal from './NewDialogModal.vue'
import type { NewDialogPayload } from './NewDialogModal.vue'
import { DIALOGS, SNOOZE_OPTIONS, accountById } from './dialogs.mock'
import type { ChannelId, Dialog, Folder, Message } from './dialogs.mock'

// Макет розділу «Діалоги» (дані — моки з dialogs.mock.ts): єдині вхідні з усіх підключених акаунтів
// (особисті Viber/Telegram/WhatsApp + боти) і видно, хто веде діалог: AI-агент, workflow чи оператор.

const dialogs = reactive<Dialog[]>(structuredClone(DIALOGS))
const selectedId = ref<string | null>('d1')
const search = ref('')
const account = ref('all')
const channel = ref<ChannelId | 'all'>('all')
const handler = ref('all')
const attention = ref(false)
const contextOpen = ref(true)
const newOpen = ref(false)

// Вхідні / Відкладені / Архів — вкладки всередині сторінки.
const folder = ref<Folder>('inbox')
// Виділення зберігається, якщо діалог є в новій вкладці (напр. щойно створений у Вхідних).
watch(folder, () => {
  if (!filtered.value.some((d) => d.id === selectedId.value)) selectedId.value = filtered.value[0]?.id ?? null
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return dialogs
    .filter((d) => d.folder === folder.value)
    .filter((d) => account.value === 'all' || d.accountId === account.value)
    .filter((d) => channel.value === 'all' || accountById(d.accountId).channel === channel.value)
    .filter((d) => handler.value === 'all' || d.handler === handler.value)
    .filter((d) => !attention.value || !!d.needsAttention)
    .filter((d) => !q || [d.contact.name, d.contact.handle, ...d.messages.map((x) => x.text)].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
})

const selected = computed(() => dialogs.find((d) => d.id === selectedId.value) ?? null)

// Opening a dialog reads it.
watch(selectedId, (id) => {
  const d = dialogs.find((x) => x.id === id)
  if (d) d.unread = 0
}, { immediate: true })

const now = (): string => new Date().toTimeString().slice(0, 5)
let seq = 1000
const push = (d: Dialog, msg: Omit<Message, 'id'>): void => {
  d.messages.push({ id: `n${++seq}`, ...msg })
  d.lastAt = msg.time
}

const takeOver = (d: Dialog): void => {
  if (d.handler === 'operator') return
  const who = d.handler === 'ai' ? `AI-агент «${d.agent}» на паузі` : `workflow «${d.workflow}» більше не відповідає`
  d.handler = 'operator'
  d.needsAttention = undefined
  push(d, { author: 'system', text: `Ви перехопили діалог — ${who}`, time: now() })
}

const handBack = (d: Dialog): void => {
  if (!d.agent) return
  d.handler = 'ai'
  push(d, { author: 'system', text: `Діалог повернуто AI-агенту «${d.agent}»`, time: now() })
}

// Moving a dialog between folders; the list follows the dialog only when asked.
const moveTo = (d: Dialog, f: Folder, note: string): void => {
  const nextId = filtered.value.filter((x) => x.id !== d.id)[0]?.id ?? null
  d.folder = f
  d.snoozedUntil = f === 'snoozed' ? d.snoozedUntil : undefined
  d.snoozeNote = f === 'snoozed' ? d.snoozeNote : undefined
  d.archivedAt = f === 'archived' ? 'Сьогодні' : undefined
  push(d, { author: 'system', text: note, time: now() })
  selectedId.value = nextId
}

const snooze = (d: Dialog, key: string): void => {
  const opt = SNOOZE_OPTIONS.find((o) => o.key === key)
  if (!opt) return
  d.snoozedUntil = opt.until
  moveTo(d, 'snoozed', `Діалог відкладено до ${opt.until}`)
  slbToast.success(`«${d.contact.name}» відкладено до ${opt.until}`)
}

const unsnooze = (d: Dialog): void => {
  moveTo(d, 'inbox', 'Діалог повернуто з відкладених')
  slbToast.info(`«${d.contact.name}» знову у вхідних`)
}

const archive = (d: Dialog): void => {
  moveTo(d, 'archived', 'Ви архівували діалог')
  slbToast.success(`«${d.contact.name}» перенесено в архів`)
}

const unarchive = (d: Dialog): void => {
  moveTo(d, 'inbox', 'Діалог повернуто з архіву')
  slbToast.info(`«${d.contact.name}» повернуто у вхідні`)
}

// Simulates the snooze timer firing: the dialog comes back with a reminder.
const wakeUp = (d: Dialog): void => {
  const note = d.snoozeNote ? ` · «${d.snoozeNote}»` : ''
  moveTo(d, 'inbox', `Час відкладення настав${note}`)
  d.unread = Math.max(d.unread, 1)
  d.needsAttention = d.snoozeNote ? `Нагадування: ${d.snoozeNote}` : 'Відкладений діалог повернувся'
  slbToast.info(`Нагадування: «${d.contact.name}»`)
}

const send = (d: Dialog, text: string): void => {
  // Writing into an archived dialog brings it back to the inbox.
  if (d.folder === 'archived') { d.folder = 'inbox'; d.archivedAt = undefined; push(d, { author: 'system', text: 'Діалог повернуто з архіву', time: now() }) }
  if (d.handler === 'ai') takeOver(d)
  push(d, { author: 'operator', text, time: now(), status: 'sent' })
}

const onAction = (d: Dialog, key: string): void => {
  if (key === 'pin') d.pinned = !d.pinned
  else if (key === 'mute') d.muted = !d.muted
  else if (key === 'unread') { d.unread = Math.max(d.unread, 1); selectedId.value = null }
  else if (key === 'clear') { d.messages = []; slbToast.success('Історію очищено') }
  else if (key.startsWith('snooze:')) snooze(d, key.slice(7))
  else if (key === 'unsnooze') unsnooze(d)
  else if (key === 'archive') archive(d)
  else if (key === 'unarchive') unarchive(d)
  else slbToast.info('У макеті ця дія лише показана')
}

const create = (p: NewDialogPayload): void => {
  const d: Dialog = {
    id: `d${++seq}`,
    folder: 'inbox',
    accountId: p.accountId,
    contact: { name: p.name, handle: p.to, phone: p.to.startsWith('+') ? p.to : undefined },
    handler: p.handler,
    agent: p.agent,
    workflow: p.workflow,
    unread: 0,
    lastAt: now(),
    tags: [],
    messages: [],
    executions: [],
  }
  if (p.workflow) d.executions.push({ id: `#${4900 + seq}`, workflow: p.workflow, status: 'running', startedAt: 'Щойно', duration: '—' })
  push(d, { author: 'system', text: p.handler === 'ai' ? `Діалог розпочато, веде AI-агент «${p.agent}»` : p.handler === 'workflow' ? `Workflow «${p.workflow}» запущено вручну` : 'Діалог розпочато вручну', time: now() })
  if (p.text) push(d, { author: 'operator', text: p.text, time: now(), status: 'sent' })
  dialogs.unshift(d)
  account.value = 'all'
  channel.value = 'all'
  handler.value = 'all'
  attention.value = false
  folder.value = 'inbox'
  selectedId.value = d.id
}
</script>

<template>
  <div class="dp">
    <DialogList
      v-model:search="search"
      v-model:account="account"
      v-model:channel="channel"
      v-model:handler="handler"
      v-model:attention="attention"
      v-model:folder="folder"
      :dialogs="filtered"
      :all="dialogs"
      :selected-id="selectedId"
      @select="selectedId = $event"
      @create="newOpen = true"
    />

    <template v-if="selected">
      <DialogThread
        :dialog="selected"
        :context-open="contextOpen"
        @send="send(selected, $event)"
        @take-over="takeOver(selected)"
        @hand-back="handBack(selected)"
        @action="onAction(selected, $event)"
        @wake-up="wakeUp(selected)"
        @toggle-context="contextOpen = !contextOpen"
      />
      <SlbSheet v-model="contextOpen" title="Деталі діалогу" :default-size="340" resizable>
        <DialogContext :key="selected.id" :dialog="selected" @take-over="takeOver(selected)" @hand-back="handBack(selected)" />
      </SlbSheet>
    </template>
    <div v-else class="dp__empty">
      <div class="dp__empty-icon">{{ folder === 'archived' ? '🗄️' : folder === 'snoozed' ? '⏰' : '💬' }}</div>
      <div class="dp__empty-title">Оберіть діалог</div>
      <p>Тут зібрані розмови з усіх підключених акаунтів — особистих і ботів. Видно, хто відповідає: AI-агент, workflow чи ви.</p>
    </div>

    <NewDialogModal v-model="newOpen" @create="create" />
    <!-- slbToast бібліотеки показується лише через свій провайдер. -->
    <SlbToastProvider />
  </div>
</template>

<style scoped>
.dp { display: flex; height: 100%; overflow: hidden; background: var(--slb-color-white); }
.dp__empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--slb-space-2xl); color: var(--slb-color-text-muted); background: var(--slb-color-gray-50); }
.dp__empty-icon { font-size: 40px; }
.dp__empty-title { margin-top: var(--slb-space-sm); font-size: var(--slb-font-lg); font-weight: var(--slb-fw-semibold); color: var(--slb-color-text); }
.dp__empty p { max-width: 360px; font-size: var(--slb-font-sm); }
</style>
