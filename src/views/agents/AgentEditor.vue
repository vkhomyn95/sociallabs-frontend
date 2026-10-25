<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import {
  SlbButton,
  SlbDrawer,
  SlbIcon,
  SlbInput,
  SlbSelect,
  SlbSlider,
  SlbTab,
  SlbToggle,
} from '@sociallabs/frontend-components'
import type { SelectOption, SelectValue, TabItem } from '@sociallabs/frontend-components'
import { ACCOUNTS, channelById } from '@/views/dialogs/dialogs.mock'
import {
  AGENT_ICONS,
  EDITOR_TABS,
  OUTPUT_MODE_LABEL,
  PROVIDER_META,
  TOOLS,
  TOOL_KIND_META,
} from './agents.mock'
import { AgentEditorTab, AgentStatus, isAgentOutputMode, isAiProvider } from './agents.types'
import type { Agent, AgentLimits } from './agents.types'

/**
 * Редактор агента у drawer. Працює з копією: зміни потрапляють у список лише після Save.
 */
const props = defineProps<{ agent: Agent | null; isNew: boolean }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ save: [agent: Agent] }>()

const draft = ref<Agent | null>(null)
const tab = ref<AgentEditorTab>(AgentEditorTab.INSTRUCTIONS)

watch(
  () => [props.agent, open.value] as const,
  ([agent, isOpen]) => {
    if (!isOpen || !agent) return
    // structuredClone не клонує reactive Proxy — беремо сирий об'єкт.
    draft.value = structuredClone(toRaw(agent))
    tab.value = AgentEditorTab.INSTRUCTIONS
  },
  { immediate: true },
)

const tabs = computed<TabItem[]>(() =>
  Object.values(AgentEditorTab).map((key) => ({
    key,
    label: EDITOR_TABS[key].label,
    icon: EDITOR_TABS[key].icon,
    badge: badgeFor(key),
  })),
)

function badgeFor(key: AgentEditorTab): number | undefined {
  if (!draft.value) return undefined
  if (key === AgentEditorTab.TOOLS) return draft.value.toolIds.length || undefined
  if (key === AgentEditorTab.CHANNELS) return draft.value.accountIds.length || undefined
  return undefined
}

// ─── Model ─────────────────────────────────────────────────────────
const providerOptions: SelectOption[] = Object.entries(PROVIDER_META).map(([value, meta]) => ({
  value,
  label: meta.label,
  icon: meta.icon,
}))
const modelOptions = computed<SelectOption[]>(() =>
  draft.value ? PROVIDER_META[draft.value.provider].models.map((m) => ({ value: m, label: m })) : [],
)
const outputOptions: SelectOption[] = Object.entries(OUTPUT_MODE_LABEL).map(([value, label]) => ({ value, label }))

function setProvider(value: SelectValue | SelectValue[] | null): void {
  if (!draft.value || !isAiProvider(value)) return
  draft.value.provider = value
  draft.value.model = PROVIDER_META[value].models[0] ?? ''
}

function setModel(value: SelectValue | SelectValue[] | null): void {
  if (draft.value && typeof value === 'string') draft.value.model = value
}

function setOutputMode(value: SelectValue | SelectValue[] | null): void {
  if (draft.value && isAgentOutputMode(value)) draft.value.outputMode = value
}

function setTemperature(value: number | [number, number]): void {
  if (draft.value && typeof value === 'number') draft.value.temperature = value
}

// ─── Tools / channels ──────────────────────────────────────────────
function toggleIn(list: string[], id: string, on: boolean): void {
  const at = list.indexOf(id)
  if (on && at === -1) list.push(id)
  if (!on && at !== -1) list.splice(at, 1)
}

// ─── Guardrails ────────────────────────────────────────────────────
function setLimit(key: keyof AgentLimits, value: string): void {
  const n = Number(value)
  if (draft.value && Number.isFinite(n) && n > 0) draft.value.limits[key] = n
}

const keywords = computed<string>({
  get: () => draft.value?.handoff.keywords.join(', ') ?? '',
  set: (value) => {
    if (draft.value) draft.value.handoff.keywords = value.split(',').map((k) => k.trim()).filter(Boolean)
  },
})

// ─── Basics ────────────────────────────────────────────────────────
function cycleIcon(): void {
  if (!draft.value) return
  const next = (AGENT_ICONS.indexOf(draft.value.icon) + 1) % AGENT_ICONS.length
  draft.value.icon = AGENT_ICONS[next]!
}

const isActive = computed<boolean>({
  get: () => draft.value?.status === AgentStatus.ACTIVE,
  set: (on) => {
    if (draft.value) draft.value.status = on ? AgentStatus.ACTIVE : AgentStatus.PAUSED
  },
})

const nameError = computed(() => (draft.value && !draft.value.name.trim() ? 'Name is required' : undefined))

function save(): void {
  if (!draft.value || nameError.value) return
  emit('save', { ...structuredClone(toRaw(draft.value)), name: draft.value.name.trim(), updatedAt: 'Just now' })
  open.value = false
}
</script>

<template>
  <SlbDrawer
    v-model="open"
    placement="right"
    :size="640"
    :title="isNew ? 'New agent' : 'Edit agent'"
    body-class="ag-editor__body"
  >
    <template v-if="draft">
      <section class="ag-editor__basics">
        <button
          type="button"
          class="ag-editor__icon"
          :class="`ag-tone--${draft.color}`"
          title="Change icon"
          @click="cycleIcon"
        >
          <SlbIcon :name="draft.icon" :size="22" />
        </button>
        <div class="ag-editor__fields">
          <SlbInput v-model="draft.name" label="Name" :error="nameError" required />
          <SlbInput v-model="draft.description" label="Description" placeholder="What does this agent do?" />
        </div>
      </section>

      <SlbTab v-model="tab" :tabs="tabs" variant="line">
        <template #[AgentEditorTab.INSTRUCTIONS]>
          <div class="ag-editor__section">
            <label class="ag-editor__label" for="ag-prompt">System prompt</label>
            <textarea
              id="ag-prompt"
              v-model="draft.systemPrompt"
              class="ag-editor__prompt"
              rows="12"
              placeholder="Describe the role, tone, what the agent may and may not do, and when to use each tool…"
            />
            <span class="ag-editor__hint">{{ draft.systemPrompt.length }} characters</span>
            <SlbSelect
              :model-value="draft.outputMode"
              label="Output mode"
              :options="outputOptions"
              @update:model-value="setOutputMode"
            />
          </div>
        </template>

        <template #[AgentEditorTab.MODEL]>
          <div class="ag-editor__section">
            <div class="ag-editor__row">
              <SlbSelect
                :model-value="draft.provider"
                label="Provider"
                :options="providerOptions"
                @update:model-value="setProvider"
              />
              <SlbSelect
                :model-value="draft.model"
                label="Model"
                :options="modelOptions"
                @update:model-value="setModel"
              />
            </div>
            <p class="ag-editor__hint">
              Uses the {{ PROVIDER_META[draft.provider].label }} key from Connections → AI providers.
            </p>
            <span class="ag-editor__label">Temperature</span>
            <div class="ag-editor__slider">
              <SlbSlider
                :model-value="draft.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                :marks="{ 0: 'Precise', 0.5: 'Balanced', 1: 'Creative' }"
                tooltip="always"
                aria-label="Temperature"
                @update:model-value="setTemperature"
              />
            </div>
          </div>
        </template>

        <template #[AgentEditorTab.TOOLS]>
          <div class="ag-editor__section">
            <p class="ag-editor__hint">The agent decides when to call a tool. Workflows run as sub-executions.</p>
            <ul class="ag-editor__list">
              <li v-for="t in TOOLS" :key="t.id" class="ag-editor__option">
                <span class="ag-editor__option-icon">
                  <SlbIcon :name="TOOL_KIND_META[t.kind].icon" :size="16" />
                </span>
                <span class="ag-editor__option-text">
                  <strong>{{ t.name }}</strong>
                  <small>{{ TOOL_KIND_META[t.kind].label }} · {{ t.description }}</small>
                </span>
                <SlbToggle
                  :model-value="draft.toolIds.includes(t.id)"
                  size="sm"
                  :aria-label="`Use ${t.name}`"
                  @update:model-value="toggleIn(draft.toolIds, t.id, $event)"
                />
              </li>
            </ul>
          </div>
        </template>

        <template #[AgentEditorTab.CHANNELS]>
          <div class="ag-editor__section">
            <p class="ag-editor__hint">Accounts where this agent answers new conversations.</p>
            <ul class="ag-editor__list">
              <li v-for="a in ACCOUNTS" :key="a.id" class="ag-editor__option">
                <span class="ag-editor__option-icon" :style="{ background: channelById(a.channel).color, color: '#fff' }">
                  <SlbIcon :name="channelById(a.channel).icon" :size="16" color="#fff" />
                </span>
                <span class="ag-editor__option-text">
                  <strong>{{ a.name }}</strong>
                  <small>{{ channelById(a.channel).label }} · {{ a.kind === 'bot' ? 'Bot' : 'Personal' }} · {{ a.handle }}</small>
                </span>
                <SlbToggle
                  :model-value="draft.accountIds.includes(a.id)"
                  size="sm"
                  :aria-label="`Answer in ${a.name}`"
                  @update:model-value="toggleIn(draft.accountIds, a.id, $event)"
                />
              </li>
            </ul>
          </div>
        </template>

        <template #[AgentEditorTab.GUARDRAILS]>
          <div class="ag-editor__section">
            <h4 class="ag-editor__subtitle">Limits per message</h4>
            <div class="ag-editor__row ag-editor__row--3">
              <SlbInput
                :model-value="draft.limits.maxIterations"
                type="number"
                label="Max iterations"
                @update:model-value="setLimit('maxIterations', $event)"
              />
              <SlbInput
                :model-value="draft.limits.maxToolCalls"
                type="number"
                label="Max tool calls"
                @update:model-value="setLimit('maxToolCalls', $event)"
              />
              <SlbInput
                :model-value="draft.limits.timeoutMs"
                type="number"
                label="Timeout, ms"
                @update:model-value="setLimit('timeoutMs', $event)"
              />
            </div>

            <h4 class="ag-editor__subtitle">Hand off to an operator</h4>
            <SlbToggle v-model="draft.handoff.onRequest" label="Customer asks for a human" />
            <SlbToggle v-model="draft.handoff.onNegativeSentiment" label="Customer is upset" />
            <SlbToggle v-model="draft.handoff.onToolFailure" label="A tool fails" />
            <SlbInput
              v-model="keywords"
              label="Keywords"
              hint="Comma-separated. A message with any of them goes to an operator."
              placeholder="refund, lawyer, complaint"
            />
          </div>
        </template>
      </SlbTab>
    </template>

    <template #footer="{ close }">
      <div class="ag-editor__footer">
        <SlbToggle v-if="draft" v-model="isActive" label="Active" />
        <span class="ag-editor__spacer" />
        <SlbButton variant="secondary" @click="close">Cancel</SlbButton>
        <SlbButton :disabled="!!nameError" @click="save">{{ isNew ? 'Create agent' : 'Save' }}</SlbButton>
      </div>
    </template>
  </SlbDrawer>
</template>
