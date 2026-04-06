<template>
  <div class="ai-agent-panel">
    <!-- Tabs -->
    <div class="panel-tabs">
      <button
        v-for="tab in TABS" :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <div class="panel-content">

      <!-- ── SETTINGS ─────────────────────────────────────────── -->
      <div v-if="activeTab === 'settings'" class="tab-body">
        <div class="form-group">
          <label>Node Name</label>
          <input v-model="local.name" class="form-ctrl" @input="push" />
        </div>

        <div class="form-group">
          <label>Agent Name</label>
          <input
            v-model="local.parameters.agentName"
            class="form-ctrl"
            placeholder="My AI Agent"
            @input="push"
          />
        </div>

        <div class="form-group">
          <label>
            System Prompt
            <span class="hint">Supports <code>{{'{{'}}$json.field{{'}}'}}</code></span>
          </label>
          <textarea
            v-model="local.parameters.systemPrompt"
            class="form-ctrl form-ctrl--code"
            rows="8"
            placeholder="You are a helpful assistant..."
            @input="push"
          />
        </div>

        <div class="form-group">
          <label>Max Iterations</label>
          <input
            v-model.number="local.parameters.maxIterations"
            type="number" min="1" max="50"
            class="form-ctrl form-ctrl--sm"
            @input="push"
          />
          <p class="field-hint">Maximum agent loop cycles before stopping.</p>
        </div>

        <div class="form-group form-group--toggle">
          <label>Return Intermediate Steps</label>
          <div
            class="toggle"
            :class="{ on: local.parameters.returnIntermediateSteps }"
            @click="toggle('returnIntermediateSteps')"
          >
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="form-group">
          <label>Disable This Node</label>
          <label class="checkbox-row">
            <input v-model="local.disabled" type="checkbox" @change="push" />
            <span>Disabled</span>
          </label>
        </div>
      </div>

      <!-- ── MODEL ────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'model'" class="tab-body">
        <div class="sub-info-card sub-info-card--model">
          <div class="sub-info-icon"><i class="fas fa-brain"></i></div>
          <div class="sub-info-text">
            <strong>Connect a Model node</strong>
            <p>
              Draw a connection from an LLM node (e.g. OpenAI, Anthropic)
              to the purple <span class="handle-pill handle-pill--model">Model</span>
              handle at the bottom of this node.
            </p>
          </div>
        </div>

        <div v-if="connectedModel" class="connected-node-card connected-node-card--model">
          <i class="fas fa-check-circle"></i>
          <span>{{ connectedModel }}</span>
          <span class="connected-type">connected</span>
        </div>
        <div v-else class="empty-sub">
          <i class="fas fa-plug"></i>
          <span>No model connected</span>
        </div>
      </div>

      <!-- ── MEMORY ────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'memory'" class="tab-body">
        <div class="sub-info-card sub-info-card--memory">
          <div class="sub-info-icon"><i class="fas fa-database"></i></div>
          <div class="sub-info-text">
            <strong>Connect a Memory node</strong>
            <p>
              Draw a connection from a Memory node to the cyan
              <span class="handle-pill handle-pill--memory">Memory</span>
              handle at the bottom of this node.
            </p>
          </div>
        </div>

        <div v-if="connectedMemory" class="connected-node-card connected-node-card--memory">
          <i class="fas fa-check-circle"></i>
          <span>{{ connectedMemory }}</span>
          <span class="connected-type">connected</span>
        </div>
        <div v-else class="empty-sub">
          <i class="fas fa-plug"></i>
          <span>No memory connected</span>
        </div>
      </div>

      <!-- ── TOOLS ─────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'tools'" class="tab-body">
        <div class="sub-info-card sub-info-card--tool">
          <div class="sub-info-icon"><i class="fas fa-tools"></i></div>
          <div class="sub-info-text">
            <strong>Connect Tool nodes</strong>
            <p>
              Draw connections from any Action node to the amber
              <span class="handle-pill handle-pill--tool">Tools</span>
              handle. Multiple tools can be connected.
            </p>
          </div>
        </div>

        <div v-if="connectedTools.length" class="tool-list">
          <div v-for="tool in connectedTools" :key="tool" class="tool-row">
            <i class="fas fa-cog"></i>
            <span>{{ tool }}</span>
          </div>
        </div>
        <div v-else class="empty-sub">
          <i class="fas fa-wrench"></i>
          <span>No tools connected</span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="panel-footer">
      <button class="btn btn-primary" @click="save">
        <i class="fas fa-check"></i> Save
      </button>
      <button class="btn btn-secondary" @click="emit('close')">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { NodeInstance } from '@/stores/workflow/types'
import { AI_EDGE_TYPES } from '@/stores/node/ai-agent.types'

const props = defineProps<{
  node      : NodeInstance
  inputData?: Record<string, unknown>[]
}>()

const emit = defineEmits<{
  update: [node: NodeInstance]
  save  : [node: NodeInstance]
  close : []
}>()

// ── Tabs ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'settings', label: 'Settings', icon: 'fas fa-sliders-h' },
  { id: 'model',    label: 'Model',    icon: 'fas fa-brain'      },
  { id: 'memory',   label: 'Memory',   icon: 'fas fa-database'   },
  { id: 'tools',    label: 'Tools',    icon: 'fas fa-tools'      },
] as const

type TabId = typeof TABS[number]['id']

const activeTab = ref<TabId>('settings')

// ── Local copy ─────────────────────────────────────────────────────────────

const local = reactive<NodeInstance>(JSON.parse(JSON.stringify(props.node)))

// Ensure parameters have defaults
if (!local.parameters.agentName)              local.parameters.agentName = ''
if (!local.parameters.systemPrompt)           local.parameters.systemPrompt = ''
if (local.parameters.maxIterations == null)   local.parameters.maxIterations = 10
if (local.parameters.returnIntermediateSteps == null) local.parameters.returnIntermediateSteps = false

// ── Live push to canvas ────────────────────────────────────────────────────

function push() {
  emit('update', JSON.parse(JSON.stringify(local)))
}

function toggle(key: string) {
  ;(local.parameters as any)[key] = !(local.parameters as any)[key]
  push()
}

function save() {
  emit('save', JSON.parse(JSON.stringify(local)))
}

// ── Read connected sub-nodes via VueFlow ───────────────────────────────────

const { edges, findNode } = useVueFlow()

const connectedModel = computed((): string | null => {
  const e = edges.value.find(
    e => e.target === props.node.nodeId && e.targetHandle === AI_EDGE_TYPES.MODEL
  )
  if (!e) return null
  const n = findNode(e.source)
  return n?.data?.name || e.source
})

const connectedMemory = computed((): string | null => {
  const e = edges.value.find(
    e => e.target === props.node.nodeId && e.targetHandle === AI_EDGE_TYPES.MEMORY
  )
  if (!e) return null
  const n = findNode(e.source)
  return n?.data?.name || e.source
})

const connectedTools = computed((): string[] =>
  edges.value
    .filter(e => e.target === props.node.nodeId && e.targetHandle === AI_EDGE_TYPES.TOOL)
    .map(e => {
      const n = findNode(e.source)
      return n?.data?.name || e.source
    })
)
</script>

<style scoped>
.ai-agent-panel { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

/* Tabs */
.panel-tabs { display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb; flex-shrink: 0; }
.tab {
  flex: 1; padding: 11px 8px; border: none; background: none; color: #6b7280;
  font-weight: 500; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 5px; font-size: 12px; transition: all 0.2s;
  border-bottom: 2px solid transparent; font-family: inherit;
}
.tab:hover { background: #f3f4f6; color: #374151; }
.tab.active { color: #6366f1; border-bottom-color: #6366f1; background: white; }

/* Content */
.panel-content { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
.tab-body { display: flex; flex-direction: column; gap: 18px; padding: 20px; }

/* Form */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group--toggle { flex-direction: row; align-items: center; justify-content: space-between; }
.form-group > label { font-weight: 500; font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px; }
.field-hint { font-size: 11px; color: #9ca3af; margin: 0; }
.hint { font-size: 11px; color: #9ca3af; font-weight: 400; }
.form-ctrl {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: inherit; color: #111827; transition: border-color 0.15s;
}
.form-ctrl:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-ctrl--code { font-family: 'JetBrains Mono', monospace; font-size: 12px; resize: vertical; }
.form-ctrl--sm   { max-width: 120px; }
.checkbox-row { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }

/* Toggle */
.toggle { width: 40px; height: 22px; border-radius: 11px; background: #d1d5db; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
.toggle.on { background: #6366f1; }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on .toggle-thumb { left: 21px; }

/* Sub-connection info cards */
.sub-info-card {
  display: flex; gap: 14px; padding: 16px; border-radius: 10px; border: 1px solid;
  background: #fafafa;
}
.sub-info-card--model  { border-color: #c4b5fd; background: #faf5ff; }
.sub-info-card--memory { border-color: #a5f3fc; background: #ecfeff; }
.sub-info-card--tool   { border-color: #fde68a; background: #fffbeb; }
.sub-info-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.sub-info-card--model  .sub-info-icon { color: #7c3aed; }
.sub-info-card--memory .sub-info-icon { color: #0891b2; }
.sub-info-card--tool   .sub-info-icon { color: #d97706; }
.sub-info-text { font-size: 13px; color: #374151; }
.sub-info-text strong { display: block; margin-bottom: 4px; }
.sub-info-text p { margin: 0; color: #6b7280; line-height: 1.5; font-size: 12px; }

/* Handle pill (inline reference) */
.handle-pill { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 700; color: white; vertical-align: middle; }
.handle-pill--model  { background: #7c3aed; }
.handle-pill--memory { background: #0891b2; }
.handle-pill--tool   { background: #d97706; }

/* Connected node card */
.connected-node-card {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  border-radius: 8px; border: 1px solid; font-size: 13px;
}
.connected-node-card--model  { border-color: #c4b5fd; background: #f5f3ff; color: #5b21b6; }
.connected-node-card--memory { border-color: #a5f3fc; background: #ecfeff; color: #0e7490; }
.connected-node-card i { font-size: 16px; }
.connected-type { margin-left: auto; font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.6; }

/* Empty state */
.empty-sub { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 30px 20px; color: #9ca3af; font-size: 13px; text-align: center; }
.empty-sub i { font-size: 28px; color: #d1d5db; }

/* Tool list */
.tool-list { display: flex; flex-direction: column; gap: 8px; }
.tool-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid #fde68a; border-radius: 8px; background: #fffbeb; color: #92400e; font-size: 13px; }
.tool-row i { color: #d97706; }

/* Footer */
.panel-footer { padding: 16px 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; background: #f9fafb; flex-shrink: 0; }
.btn { padding: 8px 18px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: 13px; transition: all 0.15s; font-family: inherit; }
.btn-primary { background: #6366f1; color: white; }
.btn-primary:hover { background: #4f46e5; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-secondary:hover { background: #d1d5db; }
</style>
