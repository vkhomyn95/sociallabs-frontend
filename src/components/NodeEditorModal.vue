<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="node-editor-overlay" @click.self="$emit('close')">
        <div class="node-editor-modal">

          <!-- Header -->
          <div class="modal-header" :style="{ borderTopColor: nodeColor }">
            <div class="header-left">
              <div class="node-icon-badge" :style="{ background: nodeColor }">
                <i :class="nodeIcon"></i>
              </div>
              <div class="header-meta">
                <h2 class="node-title">{{ node?.name || 'Node' }}</h2>
                <span class="node-discriminator">{{ node?.discriminator }}</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="hdr-btn" @click="testNode" :disabled="testing">
                <i :class="testing ? 'fas fa-spinner fa-spin' : 'fas fa-flask'"></i>
                {{ testing ? 'Testing...' : 'Test step' }}
              </button>
              <button class="hdr-btn hdr-btn--close" @click="$emit('close')">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Three-Panel Body -->
          <div class="modal-body">

            <!-- ── LEFT: Input data from previous node ── -->
            <div class="side-panel side-panel--left">
              <div class="side-header">
                <span class="side-label">
                  <i class="fas fa-sign-in-alt"></i> Input
                </span>
                <span class="item-badge">{{ inputItems.length }} item{{ inputItems.length !== 1 ? 's' : '' }}</span>
              </div>

              <div v-if="inputItems.length > 1" class="item-tabs">
                <button
                  v-for="(_, idx) in inputItems"
                  :key="idx"
                  :class="['itab', { active: selectedInputIdx === idx }]"
                  @click="selectedInputIdx = idx"
                >
                  {{ idx + 1 }}
                </button>
              </div>

              <div class="side-content">
                <div v-if="!inputItems.length" class="side-empty">
                  <i class="fas fa-database"></i>
                  <p>No input data</p>
                  <span>Run previous nodes first<br/>or add test data below</span>
                </div>
                <div v-else class="json-tree-wrap">
                  <JsonTreeNode
                    v-for="(value, key) in inputItems[selectedInputIdx]"
                    :key="key"
                    :label="String(key)"
                    :value="value"
                    :path="String(key)"
                    :depth="0"
                    :is-output="false"
                    @drag-field="onDragField"
                  />
                </div>
              </div>

              <div class="side-footer">
                <button class="side-footer-btn" @click="showTestEditor = !showTestEditor">
                  <i class="fas fa-edit"></i>
                  {{ showTestEditor ? 'Hide test data' : 'Edit test data' }}
                </button>
              </div>

              <Transition name="slide-down">
                <div v-if="showTestEditor" class="test-editor">
                  <textarea
                    v-model="testDataRaw"
                    class="test-textarea"
                    spellcheck="false"
                    placeholder='[{"key": "value"}]'
                    @input="parseTestData"
                  />
                  <span v-if="testDataError" class="test-error">{{ testDataError }}</span>
                </div>
              </Transition>
            </div>

            <!-- ── CENTER: Your existing ParameterPanel, embedded ── -->
            <div class="center-panel">
              <EmbeddedParameterPanel
                v-if="node && localNode"
                :node="localNode"
                :dragged-field="draggedField"
                @update="onParamUpdate"
                @save="onSave"
                @close="$emit('close')"
              />
            </div>

            <!-- ── RIGHT: Output from test run ── -->
            <div class="side-panel side-panel--right">
              <div class="side-header">
                <span class="side-label">
                  <i class="fas fa-sign-out-alt"></i> Output
                </span>
                <div v-if="outputData" class="output-controls">
                  <span class="item-badge">{{ outputData.length }} item{{ outputData.length !== 1 ? 's' : '' }}</span>
                  <button
                    :class="['view-btn', { active: outputView === 'tree' }]"
                    @click="outputView = 'tree'"
                    title="Tree view"
                  ><i class="fas fa-sitemap"></i></button>
                  <button
                    :class="['view-btn', { active: outputView === 'json' }]"
                    @click="outputView = 'json'"
                    title="JSON view"
                  ><i class="fas fa-code"></i></button>
                </div>
              </div>

              <div v-if="outputData && outputData.length > 1" class="item-tabs">
                <button
                  v-for="(_, idx) in outputData"
                  :key="idx"
                  :class="['itab', { active: selectedOutputIdx === idx }]"
                  @click="selectedOutputIdx = idx"
                >
                  {{ idx + 1 }}
                </button>
              </div>

              <div class="side-content">
                <div v-if="!outputData && !outputError" class="side-empty">
                  <i class="fas fa-play-circle"></i>
                  <p>No output yet</p>
                  <span>Click <strong>Test step</strong> to run<br/>this node and see results</span>
                </div>

                <div v-else-if="outputError" class="side-error">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>{{ outputError }}</p>
                </div>

                <div v-else-if="outputView === 'tree' && outputData" class="json-tree-wrap">
                  <JsonTreeNode
                    v-for="(value, key) in outputData[selectedOutputIdx]"
                    :key="key"
                    :label="String(key)"
                    :value="value"
                    :path="String(key)"
                    :depth="0"
                    :is-output="true"
                  />
                </div>

                <div v-else-if="outputData" class="raw-json-wrap">
                  <pre class="raw-json">{{ JSON.stringify(outputData[selectedOutputIdx], null, 2) }}</pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getNodeDefinition } from '@/stores/node/definitions'
import { useNodeStore } from '@/stores/node'
import type { NodeInstance } from '@/stores/workflow/types'
import JsonTreeNode from '@/components/JsonTreeNode.vue'
import EmbeddedParameterPanel from '@/components/EmbeddedParameterPanel.vue'

// ── Props ──────────────────────────────────────────────────────
const props = defineProps<{
  visible: boolean
  node: NodeInstance | null
  // Accepts Array OR single Object - both are normalized internally
  inputData?: Record<string, any>[] | Record<string, any>
}>()

const emit = defineEmits<{
  close: []
  save: [node: NodeInstance]
}>()

const nodeStore = useNodeStore()

// ── State ──────────────────────────────────────────────────────
const localNode = ref<NodeInstance | null>(null)
const testing = ref(false)
const outputData = ref<Record<string, any>[] | null>(null)
const outputError = ref<string | null>(null)
const outputView = ref<'tree' | 'json'>('tree')
const selectedInputIdx = ref(0)
const selectedOutputIdx = ref(0)
const showTestEditor = ref(false)
const testDataRaw = ref('[\n  {}\n]')
const testDataError = ref('')
const testInputData = ref<Record<string, any>[]>([])
const draggedField = ref<{ path: string; value: any } | null>(null)

// ── Computed ───────────────────────────────────────────────────
const nodeDef = computed(() =>
  props.node ? getNodeDefinition(props.node.discriminator) : null
)
const nodeColor = computed(() => nodeDef.value?.color || '#6366f1')
const nodeIcon = computed(() => nodeDef.value?.icon || 'fas fa-cube')

// Normalize inputData to always be an Array
const inputItems = computed((): Record<string, any>[] => {
  const raw = props.inputData
  if (!raw) return testInputData.value
  if (Array.isArray(raw)) return raw.length ? raw : testInputData.value
  // single plain object passed — wrap it
  return [raw]
})

// ── Watchers ───────────────────────────────────────────────────
watch(() => props.node, (node) => {
  if (node) localNode.value = JSON.parse(JSON.stringify(node))
}, { immediate: true })

watch(() => props.visible, (v) => {
  if (v) {
    outputData.value = null
    outputError.value = null
    selectedInputIdx.value = 0
    selectedOutputIdx.value = 0
    showTestEditor.value = false
  }
})

// ── Methods ────────────────────────────────────────────────────
function parseTestData() {
  testDataError.value = ''
  try {
    const parsed = JSON.parse(testDataRaw.value)
    testInputData.value = Array.isArray(parsed) ? parsed : [parsed]
  } catch (e: any) {
    testDataError.value = 'Invalid JSON: ' + e.message
  }
}

function onDragField(field: { path: string; value: any }) {
  draggedField.value = field
}

function onParamUpdate(updated: NodeInstance) {
  console.log("updated", updated)
  localNode.value = updated
}

function onSave(updated: NodeInstance) {
  console.log("save", updated)
  emit('save', updated.nodeId, updated)
  emit('close')
}

async function testNode() {
  if (!localNode.value) return
  testing.value = true
  outputData.value = null
  outputError.value = null

  try {
    const result = await nodeStore.TEST_NODE_DEFINITION({
      ...localNode.value,
      _testInputData: inputItems.value
    })
    if (result?.data) {
      outputData.value = Array.isArray(result.data) ? result.data : [result.data]
    } else {
      outputError.value = result?.error || 'Test returned no data'
    }
  } catch (e: any) {
    outputError.value = e.message
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.node-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.node-editor-modal {
  background: #1a1b1e;
  border-radius: 14px;
  width: min(1280px, 96vw);
  height: min(780px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
  border: 1px solid #2d2f36;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #16171a;
  border-bottom: 1px solid #2d2f36;
  border-top: 3px solid transparent;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.header-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.node-title {
  font-size: 15px;
  font-weight: 700;
  color: #f1f3f5;
  margin: 0;
}

.node-discriminator {
  font-size: 11px;
  color: #4b5563;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.hdr-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: transparent;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  font-family: inherit;
}
.hdr-btn:hover:not(:disabled) {
  background: #2d2f36;
  color: #f1f3f5;
  border-color: #4b5563;
}
.hdr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hdr-btn--close { padding: 6px 10px; }
.hdr-btn--close:hover {
  background: #7f1d1d !important;
  border-color: #ef4444 !important;
  color: white !important;
}

/* Three-column layout */
.modal-body {
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Side panels */
.side-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #2d2f36;
  background: #111214;
}
.side-panel--right {
  border-right: none;
  border-left: 1px solid #2d2f36;
}

.side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #16171a;
  border-bottom: 1px solid #2d2f36;
  flex-shrink: 0;
  gap: 8px;
  min-height: 40px;
}

.side-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.item-badge {
  font-size: 10px;
  color: #4b5563;
  background: #1f2025;
  padding: 2px 7px;
  border-radius: 10px;
  white-space: nowrap;
}

.output-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-btn {
  width: 22px;
  height: 22px;
  border: 1px solid #374151;
  border-radius: 4px;
  background: transparent;
  color: #4b5563;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.view-btn.active, .view-btn:hover {
  background: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

.item-tabs {
  display: flex;
  gap: 3px;
  padding: 6px 10px;
  border-bottom: 1px solid #2d2f36;
  background: #16171a;
  overflow-x: auto;
  flex-shrink: 0;
}
.itab {
  min-width: 26px;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #374151;
  background: transparent;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}
.itab.active, .itab:hover {
  background: #374151;
  color: #f1f3f5;
}

.side-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;
}
.side-content::-webkit-scrollbar { width: 3px; }
.side-content::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}

.side-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 40px 16px;
  height: 100%;
  box-sizing: border-box;
}
.side-empty i { font-size: 32px; color: #2d2f36; }
.side-empty p { margin: 0; font-size: 13px; color: #4b5563; font-weight: 600; }
.side-empty span { font-size: 11px; color: #374151; line-height: 1.6; }
.side-empty strong { color: #6366f1; }

.side-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px 16px;
  text-align: center;
  color: #f87171;
}
.side-error i { font-size: 28px; }
.side-error p { margin: 0; font-size: 12px; word-break: break-word; line-height: 1.5; }

.json-tree-wrap {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
}

.raw-json-wrap { overflow: auto; height: 100%; }
.raw-json {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #a5f3fc;
  white-space: pre;
  line-height: 1.6;
}

.side-footer {
  border-top: 1px solid #2d2f36;
  padding: 8px 10px;
  flex-shrink: 0;
  background: #16171a;
}
.side-footer-btn {
  width: 100%;
  padding: 5px;
  border: 1px solid #374151;
  border-radius: 5px;
  background: transparent;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.15s;
  font-family: inherit;
}
.side-footer-btn:hover { background: #2d2f36; color: #d1d5db; }

.test-editor {
  border-top: 1px solid #2d2f36;
  padding: 8px;
  background: #0d0e10;
  flex-shrink: 0;
}
.test-textarea {
  width: 100%;
  height: 110px;
  background: #0a0b0d;
  border: 1px solid #374151;
  border-radius: 5px;
  color: #86efac;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 7px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}
.test-textarea:focus { outline: none; border-color: #6366f1; }
.test-error { display: block; font-size: 10px; color: #f87171; margin-top: 4px; }

/* Center panel — white/light to match ParameterPanel's existing style */
.center-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 200px; opacity: 1; }
</style>
