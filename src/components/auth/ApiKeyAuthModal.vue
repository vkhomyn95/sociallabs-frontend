<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Connect Api key</h2>
        <button @click="handleClose" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <input
            v-model="credentials.api_key"
            type="text"
            placeholder="12345678"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <button @click="credentialStore.CREATE_CREDENTIAL({
          name: 'api key bot',
          type: 'API_KEY',
          data: credentials
          })" class="btn btn-secondary" :disabled="saving">
            <i class="fas fa-save"></i>
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCredentialStore } from '@/stores/credential'

const emit = defineEmits(['close', 'success']);

const isOpen = ref(true);

const credentialStore = useCredentialStore();

const credentials = ref({
  api_key: '',
});

function handleClose() {
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.auth-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-step h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.help-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.help-text a {
  color: #6366f1;
  text-decoration: none;
}

.auth-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover {
  border-color: #6366f1;
  background: #f5f5ff;
}

.method-btn i {
  font-size: 32px;
  color: #6366f1;
}

.method-btn span {
  font-weight: 600;
}

.method-btn small {
  color: #6b7280;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.qr-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #6b7280;
}

.code-input {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.code-digit {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.2s;
}

.code-digit:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.success {
  align-items: center;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  color: #10b981;
}

.user-info {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  text-align: left;
}

.user-info p {
  margin: 8px 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  border-left: 4px solid #dc2626;
}

.status-message {
  padding: 12px 16px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 6px;
  text-align: center;
}
</style>
