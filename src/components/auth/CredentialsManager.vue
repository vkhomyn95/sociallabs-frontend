<template>
  <div class="credentials-manager">
    <!-- Header -->
    <div class="manager-header">
      <div class="header-actions">
        <button @click="showAddMenu = !showAddMenu" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Add Credential
        </button>

        <!-- Add Menu Dropdown -->
        <div v-if="showAddMenu" class="add-menu">
          <button @click="addCredential('TELEGRAM_CLIENT')" class="menu-item">
            <i class="fab fa-telegram"></i>
            Telegram (TDLight)
          </button>
          <button @click="addCredential('HTTP_AUTH')" class="menu-item">
            <i class="fas fa-lock"></i>
            HTTP Authentication
          </button>
          <button @click="addCredential('API_KEY')" class="menu-item">
            <i class="fas fa-key"></i>
            API Key
          </button>
        </div>
      </div>

      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search credentials..."
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="credentialStore.loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Loading credentials...
    </div>

    <!-- Credentials List -->
    <div v-else-if="filteredCredentials.length > 0" class="credentials-list">
      <div
        v-for="credential in filteredCredentials"
        :key="credential.id"
        class="credential-card"
      >
        <div class="card-icon">
          <i :class="getCredentialIcon(credential.type)"></i>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h4>{{ credential.name }}</h4>
            <span class="credential-badge">{{ credential.type }}</span>
          </div>

          <p v-if="credential.description" class="card-description">
            {{ credential.description }}
          </p>

          <div class="card-meta">
            <span>Created: {{ formatDate(credential.createdAt) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button
            @click="testCredential(credential.id)"
            class="btn-icon"
            title="Test"
          >
            <i class="fas fa-plug"></i>
          </button>
          <button
            @click="deleteCredential(credential.id)"
            class="btn-icon danger"
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-key"></i>
      <h3>No Credentials Found</h3>
      <p>Add your first credential to connect services</p>
    </div>

    <!-- Telegram Auth Modal -->
    <TelegramAuthModal
      v-if="showTelegramAuth"
      @close="showTelegramAuth = false"
      @success="handleCredentialCreated"
    />

    <!-- Api key Auth Modal -->
    <ApiKeyAuthModal
      v-if="showApiKeyAuth"
      @close="showApiKeyAuth = false"
      @success="handleCredentialCreated"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCredentialStore } from '@/stores/credential';
import type { CredentialType } from '@/stores/credential/types';
import TelegramAuthModal from './TelegramAuthModal.vue';
import ApiKeyAuthModal from '@/components/auth/ApiKeyAuthModal.vue'

const credentialStore = useCredentialStore();

const searchQuery = ref('');
const showAddMenu = ref(false);
const showTelegramAuth = ref(false);
const showApiKeyAuth = ref(false);

const filteredCredentials = computed(() => {
  if (!searchQuery.value) return credentialStore.credentials;

  const query = searchQuery.value.toLowerCase();
  return credentialStore.credentials.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.type.toLowerCase().includes(query) ||
    c.description?.toLowerCase().includes(query)
  );
});

onMounted(() => {
  credentialStore.FETCH_CREDENTIALS();
});

const addCredential = (type: string) => {
  showAddMenu.value = false;

  if (type === 'TELEGRAM_CLIENT') {
    showTelegramAuth.value = true;
  } else {
    showApiKeyAuth.value = true;
    // Handle other credential types
    console.log('Add credential:', type);
  }
};

const testCredential = async (id: number) => {
  const result = await credentialStore.TEST_CREDENTIAL(id);

  if (result?.success) {
    alert('Credential is valid ✓');
  } else {
    alert('Credential test failed ✗');
  }
};

const deleteCredential = async (id: number) => {
  if (confirm('Are you sure you want to delete this credential?')) {
    await credentialStore.DELETE_CREDENTIAL(id);
  }
};

const handleCredentialCreated = () => {
  showTelegramAuth.value = false;
  showApiKeyAuth.value = false;
  credentialStore.FETCH_CREDENTIALS();
};

const getCredentialIcon = (type: CredentialType): string => {
  const icons: Record<CredentialType, string> = {
    TELEGRAM_CLIENT: 'fab fa-telegram',
    HTTP_AUTH: 'fas fa-lock',
    API_KEY: 'fas fa-key',
    OAUTH2: 'fas fa-shield-alt',
    DATABASE: 'fas fa-database',
    SMTP: 'fas fa-envelope',
    FTP: 'fas fa-folder',
    SSH: 'fas fa-terminal',
    AWS: 'fab fa-aws',
    GOOGLE_CLOUD: 'fab fa-google',
    AZURE: 'fab fa-microsoft'
  };

  return icons[type] || 'fas fa-key';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.credentials-manager {
  max-width: 800px;
  margin: 0 auto;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.header-actions {
  position: relative;
}

.add-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.search-box i {
  color: #9ca3af;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px;
  color: #6b7280;
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credential-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.credential-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 8px;
  color: #6366f1;
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.credential-badge {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
}

.card-description {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.card-meta {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.danger:hover {
  background: #fef2f2;
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #374151;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.btn {
  padding: 10px 16px;
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
</style>
