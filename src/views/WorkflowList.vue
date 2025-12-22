<template>
  <div class="workflow-list">
    <div class="page-header">
      <h2>Workflows</h2>
      <button @click="createWorkflow" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Create Workflow
      </button>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading workflows...
      </div>

      <div v-else-if="workflows.length === 0" class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <h3>No workflows yet</h3>
        <p>Create your first workflow to get started</p>
        <button @click="createWorkflow" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Create Workflow
        </button>
      </div>

      <div v-else class="workflow-grid">
        <div
          v-for="workflow in workflows"
          :key="workflow.id"
          class="workflow-card"
          @click="editWorkflow(workflow.id!)"
        >
          <div class="card-header">
            <h3>{{ workflow.name }}</h3>
            <span :class="`badge badge-${workflow.active ? 'success' : 'gray'}`">
              {{ workflow.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p v-if="workflow.description" class="card-description">
            {{ workflow.description }}
          </p>
          <div class="card-stats">
            <span><i class="fas fa-circle-nodes"></i> {{ workflow.nodes.length }} nodes</span>
            <span><i class="fas fa-link"></i> {{ workflow.connections.length }} connections</span>
          </div>
          <div class="card-footer">
            <span class="card-date">
              Updated {{ formatDate(workflow.updatedAt) }}
            </span>
            <div class="card-actions" @click.stop>
              <button @click="executeWorkflow(workflow.id!)" class="btn-icon">
                <i class="fas fa-play"></i>
              </button>
              <button @click="deleteWorkflow(workflow.id!)" class="btn-icon">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkflowStore } from '@/stores/workflow';

const router = useRouter();
const workflowStore = useWorkflowStore();

const workflows = computed(() => workflowStore.workflows);
const loading = computed(() => workflowStore.loading);

onMounted(() => {
  workflowStore.FETCH_WORKFLOWS();
});

function createWorkflow() {
  router.push('/workflow');
}

function editWorkflow(id: number) {
  router.push(`/workflows/${id}`);
}

function executeWorkflow(id: number) {
  workflowStore.EXECUTE_WORKFLOW(id);
}

async function deleteWorkflow(id: number) {
  if (confirm('Are you sure you want to delete this workflow?')) {
    await workflowStore.DELETE_WORKFLOW(id);
  }
}

function formatDate(date?: string): string {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString();
}
</script>

<style scoped>
.workflow-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.page-content {
  min-height: calc(100vh - 120px);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
}

.empty-state i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.workflow-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.workflow-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.card-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.card-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn,
.btn-icon {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-icon {
  padding: 6px 10px;
  background: #f9fafb;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}
</style>
