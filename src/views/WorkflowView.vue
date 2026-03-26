<template>
  <div class="workflow-editor">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="goBack" class="btn btn-icon">
          <i class="fas fa-arrow-left"></i>
        </button>
        <input
          v-model="workflowName"
          class="workflow-name-input"
          placeholder="Workflow Name"
          @blur="updateWorkflowName"
        />
        <span v-if="workflow?.active" class="badge badge-success">
          <i class="fas fa-check-circle"></i> Active
        </span>
        <span v-else class="badge badge-gray">
          <i class="fas fa-pause-circle"></i> Inactive
        </span>
      </div>

      <div class="toolbar-right">
        <button @click="saveWorkflow" class="btn btn-secondary" :disabled="saving">
          <i class="fas fa-save"></i>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button @click="toggleWorkflow" class="btn btn-primary">
          <i :class="workflow?.active ? 'fas fa-pause' : 'fas fa-play'"></i>
          {{ workflow?.active ? 'Deactivate' : 'Activate' }}
        </button>
        <button @click="executeWorkflow" class="btn btn-success">
          <i class="fas fa-bolt"></i>
          Execute
        </button>
        <button @click="showSettings = true" class="btn btn-icon">
          <i class="fas fa-cog"></i>
        </button>
        <button @click="showCredentialsManager = true" class="btn">
          <i class="fas fa-key"></i>
          Manage Credentials
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="editor-content">
      <!-- Left Panel - Available Nodes -->
      <NodePanel />

      <!-- Center - Canvas -->
      <div class="canvas-container" @drop="onDrop" @dragover.prevent>
        <WorkflowCanvas ref="canvasRef" />
      </div>
    </div>

    <!-- Settings Modal -->
    <Modal v-if="showSettings" @close="showSettings = false">
      <template #header>
        <h3>Workflow Settings</h3>
      </template>
      <template #body>
        <div class="settings-form">
          <div class="form-group">
            <label>Workflow Name</label>
            <input v-model="workflowName" class="form-control" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="workflowDescription" class="form-control" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="workflowActive" type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="saveSettings" class="btn btn-primary">Save</button>
        <button @click="showSettings = false" class="btn btn-secondary">Cancel</button>
      </template>
    </Modal>

    <!-- Execution Modal -->
    <Modal v-if="showExecution" @close="showExecution = false" size="large">
      <template #header>
        <h3>Workflow Execution</h3>
      </template>
      <template #body>
        <div class="execution-content">
          <div v-if="executionLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Executing workflow...
          </div>
          <div v-else-if="executionResult">
            <div :class="`alert alert-${executionResult.success ? 'success' : 'error'}`">
              <i :class="`fas fa-${executionResult.success ? 'check' : 'times'}-circle`"></i>
              {{ executionResult.message }}
            </div>
            <div v-if="executionResult.logs" class="execution-logs">
              <h4>Execution Logs</h4>
              <div
                v-for="log in executionResult.logs"
                :key="log.id"
                class="log-entry"
              >
                <div class="log-header">
                  <span class="log-node">{{ log.nodeName }}</span>
                  <span :class="`log-status status-${log.status.toLowerCase()}`">
                    {{ log.status }}
                  </span>
                  <span class="log-duration">{{ log.durationMs }}ms</span>
                </div>
                <div v-if="log.errorMessage" class="log-error">
                  {{ log.errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Notification Toast -->
    <Transition name="fade">
      <div v-if="notification" :class="`notification notification-${notification.type}`">
        <i :class="`fas fa-${getNotificationIcon(notification.type)}`"></i>
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Credentials Manager Modal -->
    <Modal v-if="showCredentialsManager" @close="showCredentialsManager = false">
      <template #header>
        <h3>Credentials Manager</h3>
      </template>
      <template #body>
        <CredentialsManager />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkflowStore } from '@/stores/workflow';
import WorkflowCanvas from '@/components/WorkflowCanvas.vue';
import NodePanel from '@/components/NodePanel.vue';
import Modal from '@/views/Modal.vue'
import type { NodeInstance } from '@/stores/workflow/types';
import CredentialsManager from '@/components/auth/CredentialsManager.vue'
import { useCredentialStore } from '@/stores/credential'
import { generateNodeId } from '@/stores/node/utils.ts'

const route = useRoute();
const router = useRouter();
const workflowStore = useWorkflowStore();

const canvasRef = ref<InstanceType<typeof WorkflowCanvas>>();
const showSettings = ref(false);
const showExecution = ref(false);
const saving = ref(false);
const executionLoading = ref(false);
const executionResult = ref<any>(null);
const notification = ref<{ type: string; message: string } | null>(null);

const workflow = computed(() => workflowStore.workflow);
const workflowName = ref('');
const workflowDescription = ref('');
const workflowActive = ref(false);

const credentialStore = useCredentialStore();
const showCredentialsManager = ref(false);

// Initialize
onMounted(async () => {
  const workflowId = route.params.id as string;
  if (workflowId) {
    await workflowStore.FETCH_WORKFLOW_BY_ID(parseInt(workflowId));
  } else {
    // Create new workflow
    workflowStore.workflow = {
      name: 'New Workflow',
      description: '',
      active: false,
      nodes: [],
      connections: []
    };
  }

  syncWorkflowData();
});

// Watch for workflow changes
watch(workflow, syncWorkflowData);

function syncWorkflowData() {
  if (workflow.value) {
    workflowName.value = workflow.value.name;
    workflowDescription.value = workflow.value.description || '';
    workflowActive.value = workflow.value.active;
  }
}

// Go back to workflows list
function goBack() {
  router.push('/workflows');
}

// Update workflow name
function updateWorkflowName() {
  if (workflow.value) {
    workflow.value.name = workflowName.value;
  }
}

// Save workflow
async function saveWorkflow() {
  if (!workflow.value) return;

  saving.value = true;

  try {
    let success = false;

    if (workflow.value.id) {
      success = await workflowStore.UPDATE_WORKFLOW(
        workflow.value.id,
        workflow.value
      );
    } else {
      success = await workflowStore.CREATE_WORKFLOW(workflow.value);
    }

    if (success) {
      showNotification('success', 'Workflow saved successfully');

      // Redirect to edit page if was creating new
      if (!workflow.value.id && workflowStore.workflow?.id) {
        router.replace(`/workflows/${workflowStore.workflow.id}`);
      }
    } else {
      showNotification('error', 'Failed to save workflow');
    }
  } catch (error: any) {
    showNotification('error', error.message || 'Failed to save workflow');
  } finally {
    saving.value = false;
  }
}

// Toggle workflow active state
async function toggleWorkflow() {
  if (!workflow.value?.id) {
    showNotification('warning', 'Please save workflow first');
    return;
  }

  const success = await workflowStore.TOGGLE_WORKFLOW(workflow.value.id);

  if (success) {
    showNotification(
      'success',
      workflow.value.active ? 'Workflow activated' : 'Workflow deactivated'
    );
  } else {
    showNotification('error', 'Failed to toggle workflow');
  }
}

// Execute workflow
async function executeWorkflow() {
  if (!workflow.value?.id) {
    showNotification('warning', 'Please save workflow first');
    return;
  }

  showExecution.value = true;
  executionLoading.value = true;
  executionResult.value = null;

  try {
    const success = await workflowStore.EXECUTE_WORKFLOW(workflow.value.id);

    if (success) {
      executionResult.value = {
        success: true,
        message: 'Workflow executed successfully',
        logs: [] // Will be populated from API response
      };
    } else {
      executionResult.value = {
        success: false,
        message: 'Workflow execution failed'
      };
    }
  } catch (error: any) {
    executionResult.value = {
      success: false,
      message: error.message || 'Execution failed'
    };
  } finally {
    executionLoading.value = false;
  }
}

// Save settings
function saveSettings() {
  if (workflow.value) {
    workflow.value.name = workflowName.value;
    workflow.value.description = workflowDescription.value;
    workflow.value.active = workflowActive.value;
    showSettings.value = false;
    showNotification('info', 'Settings updated. Click Save to persist changes.');
  }
}

// Handle node drop on canvas
function onDrop(event: DragEvent) {
  event.preventDefault();

  const nodeData = event.dataTransfer?.getData('application/node');
  if (!nodeData) return;

  const node = JSON.parse(nodeData);
  const rect = (event.target as HTMLElement).getBoundingClientRect();

  // Calculate position relative to canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const newNode: NodeInstance = {
    ...node,
    nodeId: generateNodeId(),
    position: { x, y },
    parameters: {},
    disabled: false
  };

  workflowStore.ADD_NODE(newNode);
  showNotification('success', `Added ${node.name} node`);
}

// Show notification
function showNotification(type: string, message: string) {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    success: 'check-circle',
    error: 'times-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}
</script>

<style scoped>
.workflow-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
}

.toolbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workflow-name-input {
  border: none;
  font-size: 18px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  min-width: 300px;
  background: #f9fafb;
}

.workflow-name-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  padding: 8px 12px;
  background: #f9fafb;
  color: #374151;
}

.btn-icon:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.execution-content {
  min-height: 300px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #6b7280;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
}

.execution-logs {
  margin-top: 20px;
}

.execution-logs h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.log-entry {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-node {
  font-weight: 500;
  flex: 1;
}

.log-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.log-duration {
  color: #6b7280;
  font-size: 12px;
}

.log-error {
  margin-top: 8px;
  color: #991b1b;
  font-size: 13px;
}

.notification {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-weight: 500;
}

.notification-success {
  background: #d1fae5;
  color: #065f46;
}

.notification-error {
  background: #fee2e2;
  color: #991b1b;
}

.notification-warning {
  background: #fef3c7;
  color: #92400e;
}

.notification-info {
  background: #dbeafe;
  color: #1e40af;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
