<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import { AI_OUTPUT_MODES, SUPPORTED_MODELS } from '@/stores/node/definitions/ai-agent'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'prompt' | 'model' | 'memory' | 'guardrails'

interface AgentConfig {
  // Prompt
  systemPrompt:           string
  inputField:             string
  outputField:            string
  outputMode:             string
  structuredOutputSchema: string
  // Model
  modelProvider:          string
  modelId:                string
  modelCredentialId:      number | null
  // Memory
  memoryEnabled:          boolean
  memoryType:             string
  memorySessionField:     string
  memoryWindowSize:       number
  // Guardrails
  maxIterations:          number
  maxToolCalls:           number
  timeoutMs:              number
  continueOnFail:         boolean
  fallbackOutput:         string
}

// ── Props / Emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [Record<string, any>]
}>()

// ── State ─────────────────────────────────────────────────────────────────────

const activeTab = ref<Tab>('prompt')

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic', icon: 'fas fa-brain' },
  { value: 'openai',    label: 'OpenAI',    icon: 'fas fa-robot' },
]

const MODELS_BY_PROVIDER: Record<string, { value: string; name: string }[]> = {
  anthropic: [
    { value: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { value: 'claude-opus-4-20250514',   name: 'Claude Opus 4'   },
    { value: 'claude-haiku-4-20250514',  name: 'Claude Haiku 4'  },
  ],
  openai: [
    { value: 'gpt-4o',      name: 'GPT-4o'      },
    { value: 'gpt-4o-mini', name: 'GPT-4o mini' },
    { value: 'o1',          name: 'o1'           },
  ],
}

const MEMORY_TYPES = [
  { value: 'WINDOW_BUFFER', name: 'Window buffer' },
  { value: 'DATABASE',      name: 'Database'      },
]

function makeDefault(): AgentConfig {
  return {
    systemPrompt:           'You are a helpful assistant.',
    inputField:             '',
    outputField:            'answer',
    outputMode:             'ANSWER_ONLY',
    structuredOutputSchema: '',
    modelProvider:          'anthropic',
    modelId:                'claude-sonnet-4-20250514',
    modelCredentialId:      null,
    memoryEnabled:          false,
    memoryType:             'WINDOW_BUFFER',
    memorySessionField:     'chatId',
    memoryWindowSize:       20,
    maxIterations:          8,
    maxToolCalls:           12,
    timeoutMs:              30_000,
    continueOnFail:         false,
    fallbackOutput:         '',
  }
}

const cfg = reactive<AgentConfig>({ ...makeDefault(), ...props.modelValue })

watch(() => props.modelValue, val => { if (val) Object.assign(cfg, val) }, { deep: true })

function push() { emit('update:modelValue', { ...cfg }) }

// ── Computed ──────────────────────────────────────────────────────────────────

const availableModels = computed(() => MODELS_BY_PROVIDER[cfg.modelProvider] ?? [])
const showSchema      = computed(() => cfg.outputMode === 'STRUCTURED')
const showFallback    = computed(() => cfg.continueOnFail)

// При зміні провайдера — скинути модель на першу доступну
function onProviderChange() {
  const models = MODELS_BY_PROVIDER[cfg.modelProvider]
  if (models?.length) cfg.modelId = models[0].value
  push()
}
</script>

<template>
  <div class="aae">

    <!-- ── Вкладки ── -->
    <div class="aae-tabs">
      <button
        v-for="tab in (['prompt', 'model', 'memory', 'guardrails'] as Tab[])"
        :key="tab"
        class="aae-tab"
        :class="{ 'aae-tab--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        <i :class="{
          'fas fa-comment-dots':      tab === 'prompt',
          'fas fa-microchip':         tab === 'model',
          'fas fa-database':          tab === 'memory',
          'fas fa-shield-alt':        tab === 'guardrails',
        }"></i>
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
      </button>
    </div>

    <div class="aae-body">

      <!-- ════════════════════════════════════════════════════
           PROMPT TAB
      ════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'prompt'">

        <div class="aae-section">
          <label class="aae-label">System prompt</label>
          <textarea
            v-model="cfg.systemPrompt"
            class="aae-textarea"
            rows="6"
            placeholder="You are a helpful assistant."
            @input="push"
          />
        </div>

        <div class="aae-row-2">
          <div class="aae-section">
            <label class="aae-label">
              Input field
              <span class="aae-hint">blank = entire item</span>
            </label>
            <input v-model="cfg.inputField" class="aae-input" placeholder="e.g. text, message" @input="push" />
          </div>
          <div class="aae-section">
            <label class="aae-label">Output field</label>
            <input v-model="cfg.outputField" class="aae-input" placeholder="answer" @input="push" />
          </div>
        </div>

        <div class="aae-section">
          <label class="aae-label">Output mode</label>
          <div class="aae-seg">
            <button
              v-for="mode in AI_OUTPUT_MODES"
              :key="mode.value"
              class="aae-seg__btn"
              :class="{ 'aae-seg__btn--active': cfg.outputMode === mode.value }"
              type="button"
              @click="cfg.outputMode = mode.value; push()"
            >
              {{ mode.name }}
            </button>
          </div>
        </div>

        <Transition name="slide">
          <div v-if="showSchema" class="aae-section">
            <label class="aae-label">JSON Schema</label>
            <textarea
              v-model="cfg.structuredOutputSchema"
              class="aae-textarea aae-textarea--code"
              rows="5"
              placeholder='{"type":"object","properties":{}}'
              @input="push"
            />
          </div>
        </Transition>

      </template>

      <!-- ════════════════════════════════════════════════════
           MODEL TAB
      ════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'model'">

        <div class="aae-section">
          <label class="aae-label">Provider</label>
          <div class="provider-grid">
            <button
              v-for="p in PROVIDERS"
              :key="p.value"
              class="provider-card"
              :class="{ 'provider-card--active': cfg.modelProvider === p.value }"
              type="button"
              @click="cfg.modelProvider = p.value; onProviderChange()"
            >
              <i :class="p.icon"></i>
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="aae-section">
          <label class="aae-label">Model</label>
          <div class="model-list">
            <button
              v-for="m in availableModels"
              :key="m.value"
              class="model-item"
              :class="{ 'model-item--active': cfg.modelId === m.value }"
              type="button"
              @click="cfg.modelId = m.value; push()"
            >
              <span class="model-item__name">{{ m.name }}</span>
              <span class="model-item__id">{{ m.value }}</span>
              <i v-if="cfg.modelId === m.value" class="fas fa-check model-item__check"></i>
            </button>
          </div>
        </div>

        <div class="aae-section">
          <label class="aae-label">
            API Key credential
            <span class="aae-hint">required</span>
          </label>
          <!-- Credential selector — спрощений варіант, можна розширити -->
          <div class="cred-info-banner">
            <i class="fas fa-info-circle"></i>
            Connect an API Key credential for <strong>{{ cfg.modelProvider === 'anthropic' ? 'Anthropic' : 'OpenAI' }}</strong>
            in the <em>Credentials</em> tab of the node editor.
          </div>
        </div>

      </template>

      <!-- ════════════════════════════════════════════════════
           MEMORY TAB
      ════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'memory'">

        <div class="aae-section">
          <label class="aae-toggle">
            <span
              class="aae-toggle__track"
              :class="{ 'aae-toggle__track--on': cfg.memoryEnabled }"
              @click="cfg.memoryEnabled = !cfg.memoryEnabled; push()"
            >
              <span class="aae-toggle__thumb" />
            </span>
            <span class="aae-toggle__label">Enable memory</span>
          </label>
        </div>

        <Transition name="slide">
          <div v-if="cfg.memoryEnabled" class="aae-memory-fields">

            <div class="aae-section">
              <label class="aae-label">Memory type</label>
              <div class="aae-seg">
                <button
                  v-for="mt in MEMORY_TYPES"
                  :key="mt.value"
                  class="aae-seg__btn"
                  :class="{ 'aae-seg__btn--active': cfg.memoryType === mt.value }"
                  type="button"
                  @click="cfg.memoryType = mt.value; push()"
                >
                  {{ mt.name }}
                </button>
              </div>
            </div>

            <div class="aae-section">
              <label class="aae-label">
                Session key field
                <span class="aae-hint">field from item.json</span>
              </label>
              <input
                v-model="cfg.memorySessionField"
                class="aae-input"
                placeholder="chatId, userId, threadId..."
                @input="push"
              />
            </div>

            <div class="aae-section">
              <label class="aae-label">Window size</label>
              <div class="aae-num">
                <input
                  v-model.number="cfg.memoryWindowSize"
                  class="aae-input"
                  type="number"
                  min="1"
                  max="200"
                  @input="push"
                />
                <span class="aae-num__unit">messages</span>
              </div>
            </div>

          </div>
        </Transition>

        <div v-if="!cfg.memoryEnabled" class="aae-empty-state">
          <i class="fas fa-database"></i>
          <p>Memory is disabled. Enable it to persist conversation history between executions.</p>
        </div>

      </template>

      <!-- ════════════════════════════════════════════════════
           GUARDRAILS TAB
      ════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'guardrails'">

        <div class="aae-row-3">
          <div class="aae-section">
            <label class="aae-label">Max iterations</label>
            <div class="aae-num">
              <input v-model.number="cfg.maxIterations" class="aae-input" type="number" min="1" max="50" @input="push" />
              <span class="aae-num__unit">steps</span>
            </div>
          </div>
          <div class="aae-section">
            <label class="aae-label">Max tool calls</label>
            <div class="aae-num">
              <input v-model.number="cfg.maxToolCalls" class="aae-input" type="number" min="1" max="50" @input="push" />
              <span class="aae-num__unit">calls</span>
            </div>
          </div>
          <div class="aae-section">
            <label class="aae-label">Timeout</label>
            <div class="aae-num">
              <input v-model.number="cfg.timeoutMs" class="aae-input" type="number" min="1000" step="1000" @input="push" />
              <span class="aae-num__unit">ms</span>
            </div>
          </div>
        </div>

        <div class="aae-section">
          <label class="aae-toggle">
            <span
              class="aae-toggle__track"
              :class="{ 'aae-toggle__track--on': cfg.continueOnFail }"
              @click="cfg.continueOnFail = !cfg.continueOnFail; push()"
            >
              <span class="aae-toggle__thumb" />
            </span>
            <span class="aae-toggle__label">Continue on fail</span>
          </label>
        </div>

        <Transition name="slide">
          <div v-if="showFallback" class="aae-section">
            <label class="aae-label">Fallback value</label>
            <input v-model="cfg.fallbackOutput" class="aae-input" placeholder="(empty string)" @input="push" />
          </div>
        </Transition>

      </template>

    </div>
  </div>
</template>

<style scoped>
/* ── Root ── */
.aae { display: flex; flex-direction: column; height: 100%; }

/* ── Tabs ── */
.aae-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
  padding: 0 4px;
}
.aae-tab {
  flex: 1; padding: 10px 6px;
  border: none; background: transparent; color: #6b7280;
  font-size: 12px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border-bottom: 2px solid transparent; font-family: inherit;
  transition: all .15s;
}
.aae-tab:hover { color: #374151; }
.aae-tab--active { color: #8b5cf6; border-bottom-color: #8b5cf6; background: white; }
.aae-tab i { font-size: 11px; }

/* ── Body ── */
.aae-body {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 14px;
}

/* ── Section ── */
.aae-section { display: flex; flex-direction: column; gap: 6px; }
.aae-row-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aae-row-3   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

/* ── Labels ── */
.aae-label {
  font-size: 12px; font-weight: 500; color: #374151;
  display: flex; align-items: baseline; gap: 6px;
}
.aae-hint { font-size: 11px; font-weight: 400; color: #9ca3af; }

/* ── Inputs ── */
.aae-input {
  padding: 7px 10px; border: 1px solid #e5e7eb;
  border-radius: 6px; font-size: 13px; font-family: inherit;
  color: #111827; background: white; width: 100%; box-sizing: border-box;
  transition: border-color .15s;
}
.aae-input:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.1); }

.aae-textarea {
  padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 13px; font-family: inherit; color: #111827; background: white;
  resize: vertical; min-height: 80px; width: 100%; box-sizing: border-box;
  transition: border-color .15s;
}
.aae-textarea:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.1); }
.aae-textarea--code { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

/* ── Provider cards ── */
.provider-grid { display: flex; gap: 8px; }
.provider-card {
  flex: 1; padding: 10px 8px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: white; cursor: pointer; font-size: 13px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #374151; transition: all .15s; font-family: inherit;
}
.provider-card:hover { border-color: #8b5cf6; }
.provider-card--active { border-color: #8b5cf6; background: #f5f3ff; color: #6d28d9; }

/* ── Model list ── */
.model-list { display: flex; flex-direction: column; gap: 4px; }
.model-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 7px;
  background: white; cursor: pointer; font-family: inherit;
  transition: all .15s; text-align: left;
}
.model-item:hover { border-color: #8b5cf6; background: #faf9ff; }
.model-item--active { border-color: #8b5cf6; background: #f5f3ff; }
.model-item__name { font-size: 13px; font-weight: 500; color: #111827; flex: 1; }
.model-item__id   { font-size: 11px; color: #9ca3af; font-family: monospace; }
.model-item__check { color: #8b5cf6; font-size: 13px; }

/* ── Credential banner ── */
.cred-info-banner {
  padding: 10px 12px; border-radius: 7px;
  background: #eff6ff; border: 1px solid #bfdbfe;
  font-size: 12px; color: #1e40af;
  display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
}
.cred-info-banner i { margin-top: 2px; flex-shrink: 0; }

/* ── Segmented control ── */
.aae-seg { display: flex; border: 1px solid #e5e7eb; border-radius: 7px; overflow: hidden; background: #f9fafb; }
.aae-seg__btn {
  flex: 1; padding: 7px 4px; border: none; background: transparent;
  font-size: 12px; font-weight: 500; color: #6b7280;
  cursor: pointer; font-family: inherit; border-right: 1px solid #e5e7eb; transition: all .15s;
}
.aae-seg__btn:last-child { border-right: none; }
.aae-seg__btn:hover { background: #f3f4f6; color: #374151; }
.aae-seg__btn--active { background: white; color: #8b5cf6; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,.06); }

/* ── Number with unit ── */
.aae-num { position: relative; }
.aae-num .aae-input { padding-right: 52px; }
.aae-num__unit { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: #9ca3af; pointer-events: none; }

/* ── Toggle ── */
.aae-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.aae-toggle__track { width: 36px; height: 20px; border-radius: 10px; background: #d1d5db; position: relative; flex-shrink: 0; cursor: pointer; transition: background .2s; }
.aae-toggle__track--on { background: #8b5cf6; }
.aae-toggle__thumb { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: left .2s; }
.aae-toggle__track--on .aae-toggle__thumb { left: 19px; }
.aae-toggle__label { font-size: 13px; color: #374151; }

/* ── Memory fields ── */
.aae-memory-fields { display: flex; flex-direction: column; gap: 14px; }

/* ── Empty state ── */
.aae-empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 32px 20px; text-align: center; color: #9ca3af;
}
.aae-empty-state i { font-size: 32px; }
.aae-empty-state p { margin: 0; font-size: 13px; line-height: 1.5; max-width: 260px; }

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active { transition: opacity .2s, max-height .25s; overflow: hidden; max-height: 400px; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
</style>
