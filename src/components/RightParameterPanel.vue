<script setup lang="ts">
/**
 * RightParameterPanel.vue
 *
 * Редагує параметри AI_AGENT ноди через bottom ports:
 *
 * portKey='ai_model'  → parameters.modelId  (об'єкт { provider, modelId, apiKey })
 * portKey='ai_memory' → parameters.memory   (MemoryConfig)
 * portKey='ai_tool'   → parameters.toolNames (string[]) — з NodeCategory.COMMUNICATION
 *
 * Не створює жодних нових нод.
 */
import { ref, computed, watch } from 'vue'
import type { NodeInstance } from '@/stores/node/types'
import { NodeCategory } from '@/stores/node/types'
import { useNodeStore } from '@/stores/node'
import { NodeIcons, NodeColors } from '@/stores/node/constants'

export type SubPanelPortKey = 'ai_model' | 'ai_memory' | 'ai_tool'

// ── Model config ───────────────────────────────────────────────
interface ModelOption {
  provider:    string
  providerId:  string
  modelId:     string
  label:       string
  badge?:      string
  badgeColor?: string
  apiKeyPlaceholder: string
}

const MODEL_OPTIONS: ModelOption[] = [
  { provider: 'Anthropic', providerId: 'anthropic', modelId: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4',  badge: 'Recommended', badgeColor: '#8b5cf6', apiKeyPlaceholder: 'sk-ant-...' },
  { provider: 'Anthropic', providerId: 'anthropic', modelId: 'claude-opus-4-20250514',   label: 'Claude Opus 4',   badge: 'Powerful',    badgeColor: '#f59e0b', apiKeyPlaceholder: 'sk-ant-...' },
  { provider: 'Anthropic', providerId: 'anthropic', modelId: 'claude-haiku-4-20250514',  label: 'Claude Haiku 4',  badge: 'Fast',        badgeColor: '#10b981', apiKeyPlaceholder: 'sk-ant-...' },
  { provider: 'OpenAI',    providerId: 'openai',    modelId: 'gpt-4o',                   label: 'GPT-4o',                                                        apiKeyPlaceholder: 'sk-...'     },
  { provider: 'OpenAI',    providerId: 'openai',    modelId: 'gpt-4o-mini',              label: 'GPT-4o Mini',     badge: 'Fast',        badgeColor: '#10b981', apiKeyPlaceholder: 'sk-...'     },
  { provider: 'OpenAI',    providerId: 'openai',    modelId: 'o1',                       label: 'o1',                                                            apiKeyPlaceholder: 'sk-...'     },
]

// ── Memory types ───────────────────────────────────────────────
interface MemoryType {
  id:          string
  label:       string
  icon:        string
  badge?:      string
  badgeColor?: string
  fields:      MemoryField[]
}

interface MemoryField {
  key:          string
  label:        string
  type:         'text' | 'password' | 'number' | 'select'
  placeholder?: string
  hint?:        string
  default?:     any
  options?:     { value: string; label: string }[]
}

const MEMORY_TYPES: MemoryType[] = [
  {
    id: 'WINDOW_BUFFER', label: 'Window Buffer', icon: 'fas fa-history',
    badge: 'Built-in', badgeColor: '#06b6d4',
    fields: [
      { key: 'windowSize',   label: 'Window size',       type: 'number', default: 20,      hint: 'Messages to keep in context' },
      { key: 'sessionField', label: 'Session key field', type: 'text',   default: 'chatId', hint: 'Field from item.json' },
    ],
  },
  {
    id: 'POSTGRES', label: 'PostgreSQL', icon: 'fas fa-server',
    fields: [
      { key: 'connectionString', label: 'Connection string', type: 'password', placeholder: 'postgresql://user:pass@host/db' },
      { key: 'tableName',        label: 'Table name',        type: 'text',     default: 'chat_history' },
      { key: 'sessionField',     label: 'Session key field', type: 'text',     default: 'chatId' },
    ],
  },
  {
    id: 'REDIS', label: 'Redis', icon: 'fas fa-bolt',
    badge: 'Fast', badgeColor: '#10b981',
    fields: [
      { key: 'redisUrl',     label: 'Redis URL',         type: 'password', placeholder: 'redis://localhost:6379' },
      { key: 'sessionField', label: 'Session key field', type: 'text',     default: 'chatId' },
      { key: 'ttl',          label: 'TTL (seconds)',      type: 'number',   default: 3600 },
    ],
  },
]

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  visible:   boolean
  portKey:   SubPanelPortKey | null
  agentNode: NodeInstance | null   // AI_AGENT нода яку редагуємо
}>()

const emit = defineEmits<{
  close:  []
  save:   [nodeId: string, parameters: Record<string, any>]
}>()

// ── Node store (для COMMUNICATION нод) ────────────────────────
const nodeStore = useNodeStore()

const communicationNodes = computed(() =>
  nodeStore.availableNodes?.nodes.filter(
    n => n.category === NodeCategory.COMMUNICATION
  ) ?? []
)

// ── Local editable copy of agent parameters ───────────────────
const localParams = ref<Record<string, any>>({})

watch([() => props.visible, () => props.agentNode], () => {
  if (props.visible && props.agentNode) {
    localParams.value = JSON.parse(JSON.stringify(props.agentNode.parameters ?? {}))
    // Defaults
    if (!localParams.value.modelId) {
      localParams.value.modelId = { provider: 'anthropic', modelId: 'claude-sonnet-4-20250514', apiKey: '' }
    }
    if (!localParams.value.memory) {
      localParams.value.memory = { enabled: false, type: 'WINDOW_BUFFER', windowSize: 20, sessionField: 'chatId' }
    }
    if (!localParams.value.toolNames) {
      localParams.value.toolNames = []
    }
  }
}, { immediate: true })

// ── Panel meta ─────────────────────────────────────────────────
const PANEL_META: Record<SubPanelPortKey, { title: string; icon: string; color: string }> = {
  ai_model:  { title: 'Language Model', icon: 'fas fa-microchip', color: '#8b5cf6' },
  ai_memory: { title: 'Memory',         icon: 'fas fa-database',  color: '#06b6d4' },
  ai_tool:   { title: 'Tools',          icon: 'fas fa-tools',     color: '#f59e0b' },
}

const meta = computed(() => props.portKey ? PANEL_META[props.portKey] : null)

// ══════════════════════════════════════════════════════════════
// MODEL
// ══════════════════════════════════════════════════════════════
const selectedModel = computed(() =>
  MODEL_OPTIONS.find(m => m.modelId === localParams.value.modelId?.modelId)
  ?? MODEL_OPTIONS[0]
)

function selectModel(opt: ModelOption) {
  localParams.value.modelId = {
    ...localParams.value.modelId,
    provider: opt.providerId,
    modelId:  opt.modelId,
  }
}

// Group by provider
const modelsByProvider = computed(() => {
  const groups: Record<string, ModelOption[]> = {}
  for (const m of MODEL_OPTIONS) {
    if (!groups[m.provider]) groups[m.provider] = []
    groups[m.provider].push(m)
  }
  return groups
})

// ══════════════════════════════════════════════════════════════
// MEMORY
// ══════════════════════════════════════════════════════════════
const memoryEnabled = computed({
  get: () => localParams.value.memory?.enabled ?? false,
  set: (v) => { localParams.value.memory = { ...localParams.value.memory, enabled: v } },
})

const selectedMemoryType = computed(() =>
  MEMORY_TYPES.find(t => t.id === localParams.value.memory?.type) ?? MEMORY_TYPES[0]
)

function selectMemoryType(t: MemoryType) {
  // Зберігаємо поточні значення полів, скидаємо на defaults нового типу
  const defaults: Record<string, any> = {}
  for (const f of t.fields) {
    defaults[f.key] = localParams.value.memory?.[f.key] ?? f.default
  }
  localParams.value.memory = { ...defaults, enabled: memoryEnabled.value, type: t.id }
}

// ══════════════════════════════════════════════════════════════
// TOOLS
// ══════════════════════════════════════════════════════════════
const toolSearch = ref('')

const filteredTools = computed(() => {
  const q = toolSearch.value.toLowerCase()
  return communicationNodes.value.filter(n =>
    !q || n.discriminator.toLowerCase().includes(q)
  )
})

// toolName = discriminator (lowercase) — те що backend очікує
function toolName(discriminator: string): string {
  return discriminator.toLowerCase()
}

function isToolSelected(discriminator: string): boolean {
  return (localParams.value.toolNames ?? []).includes(toolName(discriminator))
}

function toggleTool(discriminator: string) {
  const name = toolName(discriminator)
  const current: string[] = localParams.value.toolNames ?? []
  if (current.includes(name)) {
    localParams.value.toolNames = current.filter(t => t !== name)
  } else {
    localParams.value.toolNames = [...current, name]
  }
}

// ══════════════════════════════════════════════════════════════
// SAVE
// ══════════════════════════════════════════════════════════════
function onSave() {
  if (!props.agentNode) return
  emit('save', props.agentNode.nodeId, { ...localParams.value })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="visible && meta && agentNode"
        class="rpp-overlay"
        @click.self="$emit('close')"
      >
        <aside class="rpp" :style="{ '--accent': meta.color }">

          <!-- ── Header ── -->
          <div class="rpp__header">
            <div class="rpp__title">
              <div class="rpp__title-icon">
                <i :class="meta.icon"></i>
              </div>
              <span>{{ meta.title }}</span>
            </div>
            <button class="rpp__close" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- ══════════ MODEL ══════════ -->
          <template v-if="portKey === 'ai_model'">
            <div class="rpp__body">

              <!-- Provider groups -->
              <div
                v-for="(models, provider) in modelsByProvider"
                :key="provider"
                class="rpp__group"
              >
                <div class="rpp__group-label">{{ provider }}</div>
                <button
                  v-for="opt in models"
                  :key="opt.modelId"
                  class="rpp__item"
                  :class="{ 'rpp__item--active': localParams.modelId?.modelId === opt.modelId }"
                  @click="selectModel(opt)"
                >
                  <div class="rpp__item-dot" :style="{ background: opt.badgeColor ?? '#9ca3af' }"></div>
                  <span class="rpp__item-name">{{ opt.label }}</span>
                  <span
                    v-if="opt.badge"
                    class="rpp__badge"
                    :style="{ color: opt.badgeColor, background: opt.badgeColor + '18', border: `1px solid ${opt.badgeColor}30` }"
                  >{{ opt.badge }}</span>
                  <i v-if="localParams.modelId?.modelId === opt.modelId" class="fas fa-check rpp__check"></i>
                </button>
              </div>

              <!-- API Key -->
              <div class="rpp__divider"></div>
              <div class="rpp__field">
                <label class="rpp__label">
                  API Key
                  <span class="rpp__required">*</span>
                </label>
                <input
                  v-model="localParams.modelId.apiKey"
                  class="rpp__input"
                  type="password"
                  :placeholder="selectedModel.apiKeyPlaceholder"
                />
              </div>

            </div>
          </template>

          <!-- ══════════ MEMORY ══════════ -->
          <template v-else-if="portKey === 'ai_memory'">
            <div class="rpp__body">

              <!-- Enable toggle -->
              <div class="rpp__toggle-row">
                <span class="rpp__toggle-label">Enable memory</span>
                <div
                  class="rpp__toggle"
                  :class="{ 'rpp__toggle--on': memoryEnabled }"
                  @click="memoryEnabled = !memoryEnabled"
                >
                  <span class="rpp__toggle-thumb"></span>
                </div>
              </div>

              <template v-if="memoryEnabled">
                <!-- Memory type selector -->
                <div class="rpp__group-label" style="margin-top: 12px;">Type</div>
                <div class="rpp__mem-types">
                  <button
                    v-for="t in MEMORY_TYPES"
                    :key="t.id"
                    class="rpp__mem-type"
                    :class="{ 'rpp__mem-type--active': localParams.memory?.type === t.id }"
                    @click="selectMemoryType(t)"
                  >
                    <i :class="t.icon"></i>
                    <span>{{ t.label }}</span>
                    <span
                      v-if="t.badge"
                      class="rpp__badge"
                      :style="{ color: t.badgeColor, background: t.badgeColor + '18', border: `1px solid ${t.badgeColor}30` }"
                    >{{ t.badge }}</span>
                  </button>
                </div>

                <!-- Dynamic fields for selected type -->
                <div class="rpp__divider"></div>
                <div
                  v-for="field in selectedMemoryType.fields"
                  :key="field.key"
                  class="rpp__field"
                >
                  <label class="rpp__label">
                    {{ field.label }}
                    <span v-if="field.hint" class="rpp__hint">{{ field.hint }}</span>
                  </label>
                  <select v-if="field.type === 'select'" v-model="localParams.memory[field.key]" class="rpp__input">
                    <option v-for="o in field.options" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                  <input
                    v-else
                    v-model="localParams.memory[field.key]"
                    class="rpp__input"
                    :type="field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'"
                    :placeholder="field.placeholder"
                  />
                </div>
              </template>

              <div v-else class="rpp__empty">
                <i class="fas fa-database"></i>
                <p>Memory disabled</p>
                <span>Enable to persist conversation history between executions</span>
              </div>

            </div>
          </template>

          <!-- ══════════ TOOLS ══════════ -->
          <template v-else-if="portKey === 'ai_tool'">

            <!-- Search -->
            <div class="rpp__search-wrap">
              <i class="fas fa-search rpp__search-icon"></i>
              <input
                v-model="toolSearch"
                class="rpp__search"
                type="text"
                placeholder="Search tools..."
              />
            </div>

            <div class="rpp__body rpp__body--tools">

              <div v-if="filteredTools.length === 0" class="rpp__empty">
                <i class="fas fa-tools"></i>
                <p>No tools found</p>
              </div>

              <label
                v-for="node in filteredTools"
                :key="node.discriminator"
                class="rpp__tool"
                :class="{ 'rpp__tool--active': isToolSelected(node.discriminator) }"
              >
                <div class="rpp__tool-icon" :style="{ background: NodeColors[node.discriminator] ?? '#6b7280' }">
                  <i :class="NodeIcons[node.discriminator] ?? 'fas fa-cube'"></i>
                </div>
                <div class="rpp__tool-info">
                  <span class="rpp__tool-name">{{ node.discriminator.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) }}</span>
                  <span class="rpp__tool-id">{{ toolName(node.discriminator) }}</span>
                </div>
                <div
                  class="rpp__checkbox"
                  :class="{ 'rpp__checkbox--checked': isToolSelected(node.discriminator) }"
                  @click.prevent="toggleTool(node.discriminator)"
                >
                  <i v-if="isToolSelected(node.discriminator)" class="fas fa-check"></i>
                </div>
              </label>

            </div>

            <!-- Selected count -->
            <div v-if="(localParams.toolNames ?? []).length > 0" class="rpp__tools-summary">
              <i class="fas fa-check-circle"></i>
              {{ (localParams.toolNames ?? []).length }} tool{{ (localParams.toolNames ?? []).length > 1 ? 's' : '' }} selected
            </div>

          </template>

          <!-- ── Footer ── -->
          <div class="rpp__footer">
            <button class="rpp__save" @click="onSave">
              <i class="fas fa-save"></i>
              Save
            </button>
            <button class="rpp__cancel" @click="$emit('close')">Cancel</button>
          </div>

        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rpp-overlay {
  position: fixed; inset: 0; z-index: 1000; pointer-events: none;
}

.rpp {
  position: fixed; right: 0; top: 0; bottom: 0; width: 320px;
  background: white; border-left: 1px solid #e5e7eb;
  box-shadow: -8px 0 32px rgba(0,0,0,.1);
  display: flex; flex-direction: column;
  pointer-events: all; overflow: hidden; z-index: 1001;
}

/* Header */
.rpp__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f0f0f0;
  background: #fafafa; flex-shrink: 0;
  border-left: 3px solid var(--accent, #8b5cf6);
}
.rpp__title {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600; color: #111827;
}
.rpp__title-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: color-mix(in srgb, var(--accent) 15%, white);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--accent);
}
.rpp__close {
  width: 28px; height: 28px; border: none; background: transparent;
  color: #9ca3af; cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; font-size: 12px;
  transition: all .15s;
}
.rpp__close:hover { background: #f3f4f6; color: #374151; }

/* Body */
.rpp__body {
  flex: 1; overflow-y: auto; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.rpp__body--tools { gap: 2px; padding: 8px 10px; }

/* Groups */
.rpp__group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.rpp__group-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .6px; color: #9ca3af; padding: 4px 4px 6px;
}

/* Items (model list) */
.rpp__item {
  display: flex; align-items: center; gap: 9px; padding: 8px 10px;
  border: 1px solid transparent; border-radius: 7px; background: transparent;
  cursor: pointer; font-family: inherit; text-align: left; transition: all .15s;
  width: 100%;
}
.rpp__item:hover { background: #f9f7ff; border-color: #e9d5ff; }
.rpp__item--active { background: #f5f3ff; border-color: #c4b5fd; }

.rpp__item-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.rpp__item-name { font-size: 13px; font-weight: 500; color: #111827; flex: 1; }
.rpp__badge {
  font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px;
}
.rpp__check { color: var(--accent); font-size: 12px; }

/* Divider */
.rpp__divider { height: 1px; background: #f0f0f0; margin: 10px 0; }

/* Fields */
.rpp__field { display: flex; flex-direction: column; gap: 5px; margin-top: 6px; }
.rpp__label {
  font-size: 12px; font-weight: 500; color: #374151;
  display: flex; align-items: baseline; gap: 5px;
}
.rpp__required { color: #ef4444; }
.rpp__hint { font-size: 10px; font-weight: 400; color: #9ca3af; }
.rpp__input {
  padding: 7px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 13px; font-family: inherit; color: #111827; background: white;
  width: 100%; box-sizing: border-box; outline: none; transition: border-color .15s;
}
.rpp__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent);
}

/* Memory toggle */
.rpp__toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 0;
}
.rpp__toggle-label { font-size: 13px; font-weight: 500; color: #374151; }
.rpp__toggle {
  width: 36px; height: 20px; border-radius: 10px; background: #d1d5db;
  position: relative; cursor: pointer; transition: background .2s; flex-shrink: 0;
}
.rpp__toggle--on { background: var(--accent); }
.rpp__toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: white; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: left .2s;
}
.rpp__toggle--on .rpp__toggle-thumb { left: 19px; }

/* Memory types */
.rpp__mem-types { display: flex; flex-direction: column; gap: 3px; }
.rpp__mem-type {
  display: flex; align-items: center; gap: 9px; padding: 8px 10px;
  border: 1px solid transparent; border-radius: 7px; background: transparent;
  cursor: pointer; font-family: inherit; text-align: left; transition: all .15s;
  font-size: 13px; font-weight: 500; color: #374151;
}
.rpp__mem-type i { font-size: 12px; color: #9ca3af; width: 14px; text-align: center; }
.rpp__mem-type:hover { background: #f9fafb; border-color: #e5e7eb; }
.rpp__mem-type--active { background: #f0fdfa; border-color: #99f6e4; color: #0f766e; }
.rpp__mem-type--active i { color: #0d9488; }

/* Tools */
.rpp__search-wrap {
  position: relative; padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5; flex-shrink: 0;
}
.rpp__search-icon {
  position: absolute; left: 24px; top: 50%; transform: translateY(-50%);
  color: #9ca3af; font-size: 11px; pointer-events: none;
}
.rpp__search {
  width: 100%; box-sizing: border-box; padding: 7px 10px 7px 28px;
  border: 1px solid #e5e7eb; border-radius: 7px;
  font-size: 13px; font-family: inherit; color: #111827; outline: none;
  transition: border-color .15s;
}
.rpp__search:focus { border-color: var(--accent); }

.rpp__tool {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border: 1px solid transparent; border-radius: 7px; cursor: pointer;
  transition: all .15s; margin-bottom: 2px;
}
.rpp__tool:hover { background: #fafafa; border-color: #e5e7eb; }
.rpp__tool--active { background: #fffbeb; border-color: #fde68a; }

.rpp__tool-icon {
  width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 13px;
}
.rpp__tool-info { flex: 1; min-width: 0; }
.rpp__tool-name { display: block; font-size: 12px; font-weight: 600; color: #111827; }
.rpp__tool-id   { display: block; font-size: 10px; color: #9ca3af; font-family: monospace; }

.rpp__checkbox {
  width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid #d1d5db; background: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: white; transition: all .15s; cursor: pointer;
}
.rpp__checkbox--checked { background: var(--accent, #f59e0b); border-color: var(--accent, #f59e0b); }

.rpp__tools-summary {
  padding: 8px 14px; font-size: 12px; color: #059669;
  border-top: 1px solid #f0f0f0; flex-shrink: 0;
  display: flex; align-items: center; gap: 6px; background: #f0fdf4;
}

/* Empty */
.rpp__empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 32px 20px; color: #9ca3af; text-align: center;
}
.rpp__empty i { font-size: 24px; }
.rpp__empty p { margin: 0; font-size: 13px; font-weight: 500; }
.rpp__empty span { font-size: 11px; line-height: 1.5; }

/* Footer */
.rpp__footer {
  display: flex; gap: 8px; padding: 12px 14px;
  border-top: 1px solid #f0f0f0; flex-shrink: 0; background: #fafafa;
}
.rpp__save {
  flex: 1; padding: 8px 12px; background: var(--accent); color: white;
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 6px; font-family: inherit; transition: opacity .15s;
}
.rpp__save:hover { opacity: 0.88; }
.rpp__cancel {
  padding: 8px 14px; background: transparent; color: #6b7280;
  border: 1px solid #e5e7eb; border-radius: 7px; font-size: 13px;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.rpp__cancel:hover { background: #f3f4f6; }

/* Transition */
.drawer-enter-active { transition: opacity .2s; }
.drawer-leave-active { transition: opacity .15s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active .rpp { transition: transform .2s cubic-bezier(.25,.8,.25,1); }
.drawer-leave-active .rpp  { transition: transform .15s ease-in; }
.drawer-enter-from .rpp, .drawer-leave-to .rpp { transform: translateX(100%); }
</style>
