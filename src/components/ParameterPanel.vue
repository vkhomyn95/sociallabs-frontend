<template>
  <div class="parameter-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-title">
        <i :class="nodeIcon" class="title-icon" :style="{ color: nodeColor }"></i>
        <span>{{ localNode.name }}</span>
      </div>
      <button @click="$emit('close')" class="btn-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

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
          />
        </div>

        <!-- Dynamic Parameters -->
        <div
          v-for="param in visibleParameters"
          :key="param.name"
          class="form-group"
        >
          <label>
            {{ param.displayName }}
            <span v-if="param.required" class="required">*</span>
          </label>

          <p v-if="param.description" class="param-description">
            {{ param.description }}
          </p>

          <!-- String Input -->
          <input
            v-if="param.type === ParameterType.STRING"
            v-model="localNode.parameters[param.name]"
            type="text"
            class="form-control"
            :placeholder="param.placeholder"
            :required="param.required"
          />

          <!-- Multiline Textarea -->
          <textarea
            v-else-if="param.type === ParameterType.MULTILINE"
            v-model="localNode.parameters[param.name]"
            class="form-control"
            rows="4"
            :placeholder="param.placeholder"
            :required="param.required"
          ></textarea>

          <!-- Number Input -->
          <input
            v-else-if="param.type === ParameterType.NUMBER"
            v-model.number="localNode.parameters[param.name]"
            type="number"
            class="form-control"
            :min="param.min"
            :max="param.max"
            :required="param.required"
          />

          <!-- Boolean -->
          <label v-else-if="param.type === ParameterType.BOOLEAN" class="checkbox-label">
            <input
              v-model="localNode.parameters[param.name]"
              type="checkbox"
            />
            <span>{{ param.displayName }}</span>
          </label>

          <!-- Select/Options -->
          <select
            v-else-if="param.type === ParameterType.OPTIONS"
            v-model="localNode.parameters[param.name]"
            class="form-control"
            :required="param.required"
          >
            <option value="">Select...</option>
            <option
              v-for="opt in param.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.name }}
            </option>
          </select>

          <!-- JSON -->
          <textarea
            v-else-if="param.type === ParameterType.JSON"
            v-model="localNode.parameters[param.name]"
            class="form-control code"
            rows="6"
            placeholder="{}"
          ></textarea>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="localNode.notes"
            class="form-control"
            rows="3"
            placeholder="Add notes about this node..."
          ></textarea>
        </div>

        <!-- Disable Node -->
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="localNode.disabled" type="checkbox" />
            <span>Disable this node</span>
          </label>
        </div>
      </div>

      <!-- Credentials Tab -->
      <div v-else-if="activeTab === 'credentials'" class="credentials-tab">
        <div class="credentials-header">
          <h4>Select Credential</h4>
          <button @click="showAddCredential = true" class="btn btn-sm btn-primary">
            <i class="fas fa-plus"></i>
            Add New
          </button>
        </div>

        <div v-if="credentialStore.loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          Loading credentials...
        </div>

        <div v-else-if="availableCredentials.length === 0" class="empty-state">
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
            <div class="credential-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="credential-info">
              <div class="credential-name">{{ cred.name }}</div>
              <div class="credential-type">{{ cred.type }}</div>
              <div v-if="cred.description" class="credential-description">
                {{ cred.description }}
              </div>
            </div>
            <div v-if="localNode.credentialId === cred.id" class="credential-selected">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="panel-footer">
      <button @click="handleSave" class="btn btn-primary">
        <i class="fas fa-save"></i>
        Save Changes
      </button>
      <button @click="$emit('close')" class="btn btn-secondary">
        Cancel
      </button>
    </div>

    <!-- Add Credential Modal -->
    <TelegramAuthModal
      v-if="showAddCredential && isTelegramNode"
      @close="showAddCredential = false"
      @success="handleCredentialCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useNodeStore } from '@/stores/node';
import { useCredentialStore } from '@/stores/credential';
import { ParameterType, CredentialType, type NodeInstance } from '@/stores/node/types';
import TelegramAuthModal from '@/components/auth/TelegramAuthModal.vue';

interface Props {
  node: NodeInstance;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', nodeId: string, node: NodeInstance): void;
}>();

const nodeStore = useNodeStore();
const credentialStore = useCredentialStore();

const loading = ref(false);
const activeTab = ref<'parameters' | 'credentials'>('parameters');
const showAddCredential = ref(false);
const localNode = ref<NodeInstance>({ ...props.node });

// ========== Computed ==========

const nodeDefinition = computed(() => nodeStore.selectedNodeDefinition);

const nodeIcon = computed(() => nodeDefinition.value?.icon || 'fas fa-cog');

const nodeColor = computed(() => nodeDefinition.value?.color || '#6b7280');

const requiresCredentials = computed(() => {
  return nodeDefinition.value?.requiresCredentials || false;
});

const isTelegramNode = computed(() => {
  return nodeDefinition.value?.supportedCredentialTypes?.includes(CredentialType.TELEGRAM_BOT) ||
    nodeDefinition.value?.supportedCredentialTypes?.includes(CredentialType.TELEGRAM_CLIENT);
});

const availableCredentials = computed(() => {
  if (!nodeDefinition.value?.supportedCredentialTypes) return [];

  const types = nodeDefinition.value.supportedCredentialTypes;
  return credentialStore.credentials.filter(c => types.includes(c.type as CredentialType));
});

const visibleParameters = computed(() => {
  if (!nodeDefinition.value?.parameters) return [];

  return nodeDefinition.value.parameters.filter(param => {
    if (!param.displayCondition) return true;

    // Перевірка умови відображення
    const { field, values } = param.displayCondition;
    const currentValue = localNode.value.parameters[field];

    return values.includes(String(currentValue));
  });
});

// ========== Lifecycle ==========

onMounted(async () => {
  loading.value = true;

  // Завантажити definition ноди
  await nodeStore.FETCH_NODE_DEFINITION(props.node.discriminator);

  // Завантажити credentials якщо потрібно
  if (requiresCredentials.value) {
    await credentialStore.FETCH_CREDENTIALS();
  }

  // Встановити дефолтні значення для нових нод
  if (!props.node.parameters || Object.keys(props.node.parameters).length === 0) {
    setDefaultParameters();
  }

  loading.value = false;
});

// ========== Watchers ==========

watch(() => props.node, (newNode) => {
  localNode.value = { ...newNode };
}, { deep: true });

// ========== Methods ==========

/**
 * Встановити дефолтні значення параметрів
 */
function setDefaultParameters() {
  if (!nodeDefinition.value) return;

  const defaults: Record<string, any> = {};

  for (const param of nodeDefinition.value.parameters) {
    if (param.default !== undefined) {
      defaults[param.name] = param.default;
    }
  }

  localNode.value.parameters = { ...defaults, ...localNode.value.parameters };
}

/**
 * Вибрати credential
 */
function selectCredential(credentialId: number) {
  localNode.value.credentialId = credentialId;
}

/**
 * Обробити створення credential
 */
function handleCredentialCreated(credentialId: number) {
  showAddCredential.value = false;
  localNode.value.credentialId = credentialId;
  credentialStore.FETCH_CREDENTIALS();
}

/**
 * Зберегти зміни
 */
function handleSave() {
  emit('update', localNode.value.nodeId, localNode.value);
  emit('close');
}

// Expose ParameterType for template
defineExpose({
  ParameterType
});
</script>

<style scoped>
/* Same styles as before */
.parameter-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 30%;
  min-width: 450px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-close:hover {
  color: #374151;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab:hover {
  background: #f3f4f6;
}

.tab.active {
  color: #6366f1;
  border-bottom: 2px solid #6366f1;
  background: white;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  padding: 40px;
}

.parameters {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.required {
  color: #ef4444;
}

.param-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control.code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

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

.credentials-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credential-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.credential-card:hover {
  border-color: #6366f1;
  background: #f5f5ff;
}

.credential-card.selected {
  border-color: #6366f1;
  background: #eff6ff;
}

.credential-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 8px;
  color: #6366f1;
  font-size: 18px;
}

.credential-info {
  flex: 1;
}

.credential-name {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.credential-type {
  font-size: 12px;
  color: #6b7280;
}

.credential-description {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.credential-selected {
  color: #10b981;
  font-size: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.panel-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #6366f1;
  color: white;
  flex: 1;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>
