<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbAvatar, SlbButton, SlbIcon, SlbInput, SlbModal, SlbSelect, SlbTab } from '@sociallabs/frontend-components'
import type { SelectOption, TabItem } from '@sociallabs/frontend-components'
import { ACCOUNTS, AGENTS, WORKFLOWS, accountById, channelById } from './dialogs.mock'
import type { Handler } from './dialogs.mock'

export interface NewDialogPayload {
  accountId: string
  to: string
  name: string
  text: string
  handler: Handler
  agent?: string
  workflow?: string
}

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ create: [payload: NewDialogPayload] }>()

const accountId = ref<string | null>('viber-me')
const to = ref('')
const text = ref('')
const handler = ref<string>('operator')
const agent = ref<string | null>(AGENTS[0]!)
const workflow = ref<string | null>(WORKFLOWS[0]!)
const found = ref<{ name: string } | null>(null)
const searching = ref(false)

const accountOptions: SelectOption[] = ACCOUNTS.map((a) => ({
  value: a.id,
  label: `${channelById(a.channel).label} · ${a.kind === 'bot' ? `${a.name} (бот)` : a.handle}`,
  icon: channelById(a.channel).icon,
}))

const account = computed(() => (accountId.value ? accountById(accountId.value) : null))

// Bots can only answer users who wrote first — a new outgoing dialog needs a personal account.
const botWarning = computed(() => account.value?.kind === 'bot')

const toPlaceholder = computed(() => {
  const ch = account.value?.channel
  if (ch === 'telegram') return '@username або +380…'
  return '+380 XX XXX XX XX'
})

const handlerTabs: TabItem[] = [
  { key: 'operator', label: 'Я', icon: 'object_user' },
  { key: 'ai', label: 'AI-агент', icon: 'ai_sparkle' },
  { key: 'workflow', label: 'Workflow', icon: 'dev_nodes' },
]

watch([accountId, to], () => (found.value = null))

const find = (): void => {
  searching.value = true
  setTimeout(() => {
    found.value = { name: to.value.startsWith('@') ? to.value.slice(1) : 'Новий контакт' }
    searching.value = false
  }, 600)
}

const canCreate = computed(() => !!accountId.value && !!found.value && !botWarning.value && (handler.value !== 'operator' || !!text.value.trim()))

const submit = (): void => {
  if (!canCreate.value || !accountId.value) return
  emit('create', {
    accountId: accountId.value,
    to: to.value,
    name: found.value!.name,
    text: text.value.trim(),
    handler: handler.value as Handler,
    agent: handler.value === 'ai' ? agent.value ?? undefined : undefined,
    workflow: handler.value === 'workflow' ? workflow.value ?? undefined : undefined,
  })
  open.value = false
  to.value = ''
  text.value = ''
  found.value = null
}
</script>

<template>
  <SlbModal v-model="open" title="Новий діалог" size="md">
    <div class="nd">
      <SlbSelect v-model="accountId" :options="accountOptions" label="З акаунта" />
      <p v-if="botWarning" class="nd__warn">
        <SlbIcon name="status_warning" :size="16" />
        Бот не може написати першим — клієнт має розпочати діалог з ботом. Оберіть особистий акаунт.
      </p>

      <div class="nd__to">
        <SlbInput v-model="to" label="Кому" :placeholder="toPlaceholder" icon-left="object_phone" :disabled="botWarning" />
        <SlbButton variant="secondary" :loading="searching" :disabled="!to || botWarning" icon-left="action_search" @click="find">Знайти</SlbButton>
      </div>
      <div v-if="found" class="nd__found">
        <SlbAvatar :name="found.name" size="sm" />
        <div>
          <div class="nd__found-name">{{ found.name }}</div>
          <div class="nd__found-sub">{{ to }} · знайдено в {{ account && channelById(account.channel).label }}</div>
        </div>
        <SlbIcon name="status_success" :size="18" class="nd__ok" />
      </div>

      <div>
        <div class="nd__label">Хто веде діалог далі</div>
        <SlbTab v-model="handler" :tabs="handlerTabs" variant="segmented" />
      </div>
      <SlbSelect v-if="handler === 'ai'" v-model="agent" :options="AGENTS.map((a) => ({ label: a, value: a }))" label="AI-агент" hint="Агент відповідатиме на вхідні повідомлення, доки ви не перехопите діалог" />
      <SlbSelect v-if="handler === 'workflow'" v-model="workflow" :options="WORKFLOWS.map((w) => ({ label: w, value: w }))" label="Workflow" hint="Контакт буде передано як вхідні дані тригера" />

      <div>
        <div class="nd__label">Перше повідомлення {{ handler === 'operator' ? '' : '(необов\'язково — інакше напише агент/workflow)' }}</div>
        <textarea v-model="text" class="nd__text" rows="3" placeholder="Добрий день! …" />
      </div>
    </div>

    <template #footer>
      <SlbButton variant="ghost" @click="open = false">Скасувати</SlbButton>
      <SlbButton icon-left="action_send" :disabled="!canCreate" @click="submit">Почати діалог</SlbButton>
    </template>
  </SlbModal>
</template>

<style scoped>
.nd { display: flex; flex-direction: column; gap: var(--slb-space-base); }
.nd__to { display: flex; gap: var(--slb-space-sm); align-items: flex-end; }
.nd__to > :first-child { flex: 1; }
.nd__warn { display: flex; gap: var(--slb-space-sm); margin: 0; padding: var(--slb-space-sm); font-size: var(--slb-font-sm); border-radius: var(--slb-radius-md); background: var(--slb-color-warning-light); }
.nd__warn > :first-child { color: var(--slb-color-warning); flex-shrink: 0; }
.nd__found { display: flex; align-items: center; gap: var(--slb-space-sm); padding: var(--slb-space-sm); border: 1px solid var(--slb-color-success-ring); background: var(--slb-color-success-light); border-radius: var(--slb-radius-md); }
.nd__found > div { flex: 1; }
.nd__found-name { font-weight: var(--slb-fw-medium); }
.nd__found-sub { font-size: var(--slb-font-xs); color: var(--slb-color-text-muted); }
.nd__ok { color: var(--slb-color-success); }
.nd__label { font-size: var(--slb-font-sm); font-weight: var(--slb-fw-medium); margin-bottom: var(--slb-space-xs); }
.nd__text { width: 100%; resize: vertical; font: inherit; padding: var(--slb-space-sm); border: 1px solid var(--slb-color-border); border-radius: var(--slb-radius-md); }
.nd__text:focus { outline: none; border-color: var(--slb-color-primary); box-shadow: 0 0 0 3px var(--slb-color-primary-ring); }
</style>
