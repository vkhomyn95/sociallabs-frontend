<template>
  <div class="embedded-param-panel">
    <!-- Tabs -->
    <div class="panel-tabs">
      <button
        :class="['tab', { active: activeTab === 'parameters' }]"
        @click="activeTab = 'parameters'"
      >
        <i class="fas fa-sliders-h"></i>
        Parameters
      </button>
      <button
        v-if="requiresCredentials"
        :class="['tab', { active: activeTab === 'credentials' }]"
        @click="activeTab = 'credentials'"
      >
        <i class="fas fa-key"></i>
        Credentials
      </button>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading...
      </div>

      <!-- Parameters Tab -->
      <div v-else-if="activeTab === 'parameters' && nodeDefinition" class="parameters">

        <!-- Node Name -->
        <div class="form-group">
          <label>Node Name</label>
          <input
            v-model="localNode.name"
            type="text"
            class="form-control"
            placeholder="Enter node name"
            @input="emitUpdate"
          />
        </div>

        <!-- Dynamic Parameters -->
        <div
          v-for="param in visibleParameters"
          :key="param.name"
          class="form-group"
          :class="{ 'form-group--drop-active': dropTargetParam === param.name }"
          @dragover.prevent="dropTargetParam = param.name"
          @dragleave="dropTargetParam = null"
          @drop="onDropToParam(param.name, $event)"
        >
          {{param.type}}
          <label>
            {{ param.displayName || param.name }}
            <span v-if="param.required" class="required">*</span>
          </label>

          <p v-if="param.description" class="param-description">{{ param.description }}</p>

          <!-- Drop hint -->
          <div v-if="dropTargetParam === param.name" class="drop-hint">
            <i class="fas fa-link"></i> Drop to insert field reference
          </div>

          <!-- String -->
          <input
            v-if="param.type === 'STRING' || param.type === 'string'"
            v-model="localNode.parameters[param.name]"
            type="text"
            class="form-control"
            :placeholder="param.placeholder || ''"
            @input="emitUpdate"
          />

          <!-- Multiline -->
          <textarea
            v-else-if="param.type === 'MULTILINE' || param.type === 'multiline'"
            v-model="localNode.parameters[param.name]"
            class="form-control"
            rows="4"
            :placeholder="param.placeholder || ''"
            @input="emitUpdate"
          />

          <!-- Number -->
          <input
            v-else-if="param.type === 'NUMBER' || param.type === 'number'"
            v-model.number="localNode.parameters[param.name]"
            type="number"
            class="form-control"
            :min="param.min"
            :max="param.max"
            @input="emitUpdate"
          />

          <!-- Boolean -->
          <label
            v-else-if="param.type === 'BOOLEAN' || param.type === 'boolean'"
            class="checkbox-label"
          >
            <div
              class="toggle-switch"
              :class="{ on: !!localNode.parameters[param.name] }"
              @click="toggleBool(param.name)"
            >
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-text">
              {{ localNode.parameters[param.name] ? 'Enabled' : 'Disabled' }}
            </span>
          </label>

          <!-- Options / Select -->
          <select
            v-else-if="param.type === 'OPTIONS' || param.type === 'options'"
            v-model="localNode.parameters[param.name]"
            class="form-control"
            @change="emitUpdate"
          >
            <option value="">— Select —</option>
            <option
              v-for="opt in param.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.name }}
            </option>
          </select>

          <!-- Multi-options -->
          <div
            v-else-if="param.type === 'multiOptions'"
            class="multi-options"
          >
            <label
              v-for="opt in param.options"
              :key="opt.value"
              class="multi-opt"
            >
              <input
                type="checkbox"
                :checked="isMultiChecked(param.name, opt.value)"
                @change="toggleMulti(param.name, opt.value)"
              />
              <span>{{ opt.name }}</span>
            </label>
          </div>

          <!-- JSON -->
          <textarea
            v-else-if="param.type === 'JSON' || param.type === 'json'"
            v-model="localNode.parameters[param.name]"
            class="form-control code"
            rows="6"
            placeholder="{}"
            @input="emitUpdate"
          />

          <!-- CONDITIONS type — для IF ноди -->
          <ConditionsEditor
            v-else-if="param.type === 'conditions'"
            v-model="localNode.parameters[param.name]"
            :combine-op="localNode.parameters['combineOperation'] || 'AND'"
            @update:combine-op="localNode.parameters['combineOperation'] = $event; emitUpdate()"
            @update:model-value="emitUpdate"
          />

          <!-- SWITCH_RULES type — для Switch ноди -->
          <SwitchRulesEditor
            v-else-if="param.type === 'switch-rules'"
            v-model="localNode.parameters[param.name]"
            @update:model-value="onSwitchRulesUpdate"
          />

          <!-- Fallback -->
          <input
            v-else
            v-model="localNode.parameters[param.name]"
            type="text"
            class="form-control"
            @input="emitUpdate"
          />
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="localNode.notes"
            class="form-control"
            rows="2"
            placeholder="Add notes about this node..."
            @input="emitUpdate"
          />
        </div>

        <!-- Disable Node -->
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="localNode.disabled" type="checkbox" @change="emitUpdate" />
            <span>Disable this node</span>
          </label>
        </div>
      </div>

      <!-- Credentials Tab -->
      <div v-else-if="activeTab === 'credentials'" class="credentials-tab">
        <div class="credentials-header">
          <h4>Select Credential</h4>
          <button @click="showAddCredential = true" class="btn btn-sm btn-primary">
            <i class="fas fa-plus"></i> Add New
          </button>
        </div>

        <div v-if="credentialStore.loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>

        <div v-else-if="!availableCredentials.length" class="empty-creds">
          <i class="fas fa-key"></i>
          <p>No credentials found</p>
          <button @click="showAddCredential = true" class="btn btn-primary">
            Create First Credential
          </button>
        </div>

        <div v-else class="credentials-list">
          <div
            v-for="cred in availableCredentials"
            :key="cred.id"
            :class="['credential-card', { selected: localNode.credentialId === cred.id }]"
            @click="selectCredential(cred.id)"
          >
            <div class="cred-icon"><i class="fas fa-key"></i></div>
            <div class="cred-info">
              <div class="cred-name">{{ cred.name }}</div>
              <div class="cred-type">{{ cred.type }}</div>
            </div>
            <i v-if="localNode.credentialId === cred.id" class="fas fa-check-circle cred-check"></i>
          </div>
        </div>

        <TelegramAuthModal
          v-if="showAddCredential && isTelegramNode"
          @close="showAddCredential = false"
          @success="handleCredentialCreated"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="panel-footer">
      <button class="btn btn-primary" @click="handleSave">
        <i class="fas fa-check"></i> Save
      </button>
      <button class="btn btn-secondary" @click="$emit('close')">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNodeStore } from '@/stores/node'
import { useCredentialStore } from '@/stores/credential'
import { CredentialType, type NodeInstance } from '@/stores/node/types'
import TelegramAuthModal from '@/components/auth/TelegramAuthModal.vue'
import ConditionsEditor from '@/components/ConditionsEditor.vue'
import SwitchRulesEditor from '@/components/SwitchRulesEditor.vue'

const props = defineProps<{
  node: NodeInstance
  draggedField?: { path: string; value: any } | null
}>()

const emit = defineEmits<{
  update: [node: NodeInstance]
  save: [node: NodeInstance]
  close: []
}>()

const nodeStore = useNodeStore()
const credentialStore = useCredentialStore()

const loading = ref(false)
const activeTab = ref<'parameters' | 'credentials'>('parameters')
const showAddCredential = ref(false)
const dropTargetParam = ref<string | null>(null)

// Deep clone to avoid mutating prop directly
const localNode = ref<NodeInstance>(deepClone(props.node))

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ── Computed ────────────────────────────────────────────────────
const nodeDefinition = computed(() => nodeStore.selectedNodeDefinition)

const requiresCredentials = computed(() =>
  nodeDefinition.value?.requiresCredentials ?? false
)

const isTelegramNode = computed(() =>
  nodeDefinition.value?.supportedCredentialTypes?.some(
    (t: string) => t === CredentialType.TELEGRAM_BOT || t === CredentialType.TELEGRAM_CLIENT
  ) ?? false
)

const availableCredentials = computed(() => {
  const types = nodeDefinition.value?.supportedCredentialTypes ?? []
  if (!types.length) return credentialStore.credentials
  return credentialStore.credentials.filter(c => types.includes(c.type as CredentialType))
})

const visibleParameters = computed(() => {
  if (!nodeDefinition.value?.parameters) return []
  return nodeDefinition.value.parameters.filter((param: any) => {
    // Support both 'displayCondition' (your old format) and 'displayOptions.show' (new format)
    if (param.displayCondition) {
      const { field, values } = param.displayCondition
      return values.includes(String(localNode.value.parameters[field] ?? ''))
    }
    if (param.displayOptions?.show) {
      return Object.entries(param.displayOptions.show).every(([key, vals]) =>
        (vals as any[]).includes(localNode.value.parameters[key])
      )
    }
    return true
  })
})

function onSwitchRulesUpdate(rules: any[]) {
  localNode.value.parameters['rules'] = rules
  // Повідомляємо canvas що outputs змінились
  emitUpdate()
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  await nodeStore.FETCH_NODE_DEFINITION(props.node.discriminator)
  if (requiresCredentials.value) {
    await credentialStore.FETCH_CREDENTIALS()
  }
  setDefaults()
  loading.value = false
})

// ── Watchers ────────────────────────────────────────────────────
watch(() => props.node, (n) => {
  localNode.value = deepClone(n)
}, { deep: true })

// When a field is dragged from the left panel and dropped here
watch(() => props.draggedField, (field) => {
  if (field && dropTargetParam.value) {
    insertFieldRef(dropTargetParam.value, field.path)
  }
})

// ── Methods ─────────────────────────────────────────────────────
function setDefaults() {
  if (!nodeDefinition.value?.parameters) return
  const defaults: Record<string, any> = {}
  for (const p of nodeDefinition.value.parameters) {
    if (p.default !== undefined && localNode.value.parameters[p.name] === undefined) {
      defaults[p.name] = p.default
    }
  }
  localNode.value.parameters = { ...defaults, ...localNode.value.parameters }
}

function emitUpdate() {
  emit('update', deepClone(localNode.value))
}

function handleSave() {
  emit('save', deepClone(localNode.value))
}

function selectCredential(id: number) {
  localNode.value.credentialId = id
  emitUpdate()
}

function handleCredentialCreated(id: number) {
  showAddCredential.value = false
  localNode.value.credentialId = id
  credentialStore.FETCH_CREDENTIALS()
  emitUpdate()
}

function toggleBool(name: string) {
  localNode.value.parameters[name] = !localNode.value.parameters[name]
  emitUpdate()
}

function isMultiChecked(name: string, val: string): boolean {
  const arr = localNode.value.parameters[name]
  return Array.isArray(arr) && arr.includes(val)
}

function toggleMulti(name: string, val: string) {
  const arr: string[] = Array.isArray(localNode.value.parameters[name])
    ? [...localNode.value.parameters[name]]
    : []
  const idx = arr.indexOf(val)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(val)
  localNode.value.parameters[name] = arr
  emitUpdate()
}

// Handle drop from left panel JSON tree
function onDropToParam(paramName: string, e: DragEvent) {
  e.preventDefault()
  dropTargetParam.value = null
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return
  try {
    const field = JSON.parse(raw)
    insertFieldRef(paramName, field.path)
  } catch {}
}

function insertFieldRef(paramName: string, path: string) {
  const ref = `{{$json.${path}}}`
  const current = localNode.value.parameters[paramName]
  localNode.value.parameters[paramName] = typeof current === 'string'
    ? current + ref
    : ref
  emitUpdate()
}
</script>

<style scoped>
.embedded-param-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: white;
}

/* Tabs */
.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  font-family: inherit;
}
.tab:hover { background: #f3f4f6; color: #374151; }
.tab.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
  background: white;
}

/* Content scroll area */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.panel-content::-webkit-scrollbar { width: 4px; }
.panel-content::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  padding: 40px;
}

/* Parameters */
.parameters {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 8px;
  padding: 4px;
  transition: background 0.15s;
}
.form-group--drop-active {
  background: rgba(99, 102, 241, 0.06);
  outline: 1px dashed #6366f1;
}

.form-group > label {
  font-weight: 500;
  font-size: 13px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}
.required { color: #ef4444; }

.param-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.drop-hint {
  font-size: 11px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.15s;
  font-family: inherit;
  color: #111827;
}
.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.form-control.code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
}

/* Toggle */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.toggle-switch {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #d1d5db;
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}
.toggle-switch.on { background: #6366f1; }
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-switch.on .toggle-thumb { left: 21px; }
.toggle-text { font-size: 13px; color: #6b7280; }

/* Multi-options */
.multi-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.multi-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.multi-opt input { accent-color: #6366f1; width: 15px; height: 15px; }

/* Credentials tab */
.credentials-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.credentials-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.credentials-header h4 { margin: 0; font-size: 15px; font-weight: 600; }

.empty-creds {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}
.empty-creds i { font-size: 40px; color: #d1d5db; }
.empty-creds p { margin: 0; color: #6b7280; }

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.credential-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.credential-card:hover { border-color: #6366f1; background: #f5f5ff; }
.credential-card.selected { border-color: #6366f1; background: #eff6ff; }
.cred-icon {
  width: 36px;
  height: 36px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-size: 16px;
  flex-shrink: 0;
}
.cred-info { flex: 1; }
.cred-name { font-weight: 600; font-size: 13px; color: #374151; }
.cred-type { font-size: 11px; color: #6b7280; }
.cred-check { color: #10b981; font-size: 18px; }

/* Footer */
.panel-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  background: #f9fafb;
  flex-shrink: 0;
}

.btn {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  transition: all 0.15s;
  font-family: inherit;
}
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-primary { background: #6366f1; color: white; }
.btn-primary:hover { background: #4f46e5; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-secondary:hover { background: #d1d5db; }
</style>
