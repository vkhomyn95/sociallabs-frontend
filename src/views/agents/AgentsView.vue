<script setup lang="ts">
import { computed, reactive, ref, toRaw } from 'vue'
import { SlbButton, SlbConfirmModal, SlbIcon, SlbInput, SlbTab, SlbToastProvider, slbToast } from '@sociallabs/frontend-components'
import type { TabItem } from '@sociallabs/frontend-components'
import AgentCard from './AgentCard.vue'
import AgentEditor from './AgentEditor.vue'
import { AGENTS, STATUS_META, createDraftAgent, nextAgentId } from './agents.mock'
import { ALL_STATUSES, AgentCardAction, AgentStatus } from './agents.types'
import type { Agent, AgentStatusFilter } from './agents.types'

// Макет розділу «Agents» (дані — моки з agents.mock.ts): AI-агенти, що ведуть діалоги
// в підключених акаунтах і викликають воркфлоу як інструменти.

const agents = reactive<Agent[]>(structuredClone(AGENTS))
const search = ref('')
const status = ref<AgentStatusFilter>(ALL_STATUSES)

const editorOpen = ref(false)
const editing = ref<Agent | null>(null)
const isNew = ref(false)
const deleting = ref<Agent | null>(null)

const countBy = (s: AgentStatus): number => agents.filter((a) => a.status === s).length

const tabs = computed<TabItem[]>(() => [
  { key: ALL_STATUSES, label: 'All', badge: agents.length },
  ...Object.values(AgentStatus).map((s) => ({ key: s, label: STATUS_META[s].label, badge: countBy(s) })),
])

const statusFilter = computed<string>({
  get: () => status.value,
  set: (key) => {
    status.value = key === ALL_STATUSES ? ALL_STATUSES : (Object.values(AgentStatus).find((s) => s === key) ?? ALL_STATUSES)
  },
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return agents
    .filter((a) => status.value === ALL_STATUSES || a.status === status.value)
    .filter((a) => !q || [a.name, a.description, a.model].some((s) => s.toLowerCase().includes(q)))
})

function openEditor(agent: Agent, asNew = false): void {
  editing.value = agent
  isNew.value = asNew
  editorOpen.value = true
}

const create = (): void => openEditor(createDraftAgent(), true)

function onSave(saved: Agent): void {
  const at = agents.findIndex((a) => a.id === saved.id)
  if (at === -1) agents.unshift(saved)
  else agents.splice(at, 1, saved)
  slbToast.success(isNew.value ? `Agent «${saved.name}» created` : `Agent «${saved.name}» saved`)
}

const ACTIONS: Record<AgentCardAction, (agent: Agent) => void> = {
  [AgentCardAction.EDIT]: (agent) => openEditor(agent),
  [AgentCardAction.TOGGLE]: (agent) => {
    agent.status = agent.status === AgentStatus.ACTIVE ? AgentStatus.PAUSED : AgentStatus.ACTIVE
    slbToast.info(`«${agent.name}» ${agent.status === AgentStatus.ACTIVE ? 'activated' : 'paused'}`)
  },
  [AgentCardAction.DUPLICATE]: (agent) => {
    const copy: Agent = {
      ...structuredClone(toRaw(agent)),
      id: nextAgentId(),
      name: `${agent.name} (copy)`,
      status: AgentStatus.DRAFT,
      accountIds: [],
      stats: { conversations7d: 0, resolvedRate: 0, handoffRate: 0 },
      updatedAt: 'Just now',
    }
    agents.splice(agents.indexOf(agent) + 1, 0, copy)
    slbToast.success(`«${agent.name}» duplicated as a draft`)
  },
  [AgentCardAction.DELETE]: (agent) => {
    deleting.value = agent
  },
}

const confirmOpen = computed<boolean>({
  get: () => !!deleting.value,
  set: (value) => {
    if (!value) deleting.value = null
  },
})

function confirmDelete(): void {
  const agent = deleting.value
  if (!agent) return
  agents.splice(agents.indexOf(agent), 1)
  slbToast.success(`Agent «${agent.name}» deleted`)
  deleting.value = null
}
</script>

<template>
  <div class="ag-page">
    <header class="ag-page__head">
      <div>
        <h1 class="ag-page__title">Agents</h1>
        <p class="ag-page__sub">AI agents that answer in your accounts and call workflows as tools.</p>
      </div>
      <SlbButton icon-left="action_plus" @click="create">New agent</SlbButton>
    </header>

    <div class="ag-page__toolbar">
      <SlbTab v-model="statusFilter" :tabs="tabs" variant="segmented" />
      <SlbInput
        v-model="search"
        class="ag-page__search"
        size="sm"
        icon-left="action_search"
        placeholder="Search agents"
        clearable
      />
    </div>

    <div v-if="filtered.length" class="ag-page__grid">
      <AgentCard
        v-for="agent in filtered"
        :key="agent.id"
        :agent="agent"
        @open="openEditor(agent)"
        @action="ACTIONS[$event](agent)"
      />
    </div>

    <div v-else class="ag-page__empty">
      <span class="ag-page__empty-icon"><SlbIcon name="ai_agent" :size="28" /></span>
      <template v-if="agents.length">
        <h2>No agents match</h2>
        <p>Try another status or search query.</p>
      </template>
      <template v-else>
        <h2>No agents yet</h2>
        <p>Create an agent, connect it to an account and it will start answering conversations.</p>
        <SlbButton icon-left="action_plus" @click="create">New agent</SlbButton>
      </template>
    </div>

    <AgentEditor v-model="editorOpen" :agent="editing" :is-new="isNew" @save="onSave" />

    <SlbConfirmModal
      v-model="confirmOpen"
      title="Delete agent"
      :message="`Delete «${deleting?.name}»? Conversations it is handling will go to an operator.`"
      confirm-label="Delete"
      danger
      @confirm="confirmDelete"
    />

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './agents.scss';
</style>
