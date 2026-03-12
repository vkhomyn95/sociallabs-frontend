<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Connect Telegram Account</h2>
        <button @click="handleClose" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Step 1: Choose Auth Method -->
        <div v-if="step === 'method'" class="auth-step">
          <h3>Choose Authorization Method</h3>
          <div class="auth-methods">
            <button @click="selectMethod('qrcode')" class="method-btn">
              <i class="fas fa-qrcode"></i>
              <span>QR Code</span>
              <small>Scan with Telegram app</small>
            </button>
            <button @click="selectMethod('phone')" class="method-btn">
              <i class="fas fa-phone"></i>
              <span>Phone Number</span>
              <small>Receive code via SMS</small>
            </button>
          </div>
        </div>

        <!-- Step 2: Enter Credentials -->
        <div v-if="step === 'credentials'" class="auth-step">
          <h3>Enter API Credentials</h3>
          <p class="help-text">
            Get your API credentials from
            <a href="https://my.telegram.org/apps" target="_blank">my.telegram.org/apps</a>
          </p>

          <div class="form-group">
            <label>API ID</label>
            <input
              v-model="credentials.apiId"
              type="text"
              placeholder="12345678"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>API Hash</label>
            <input
              v-model="credentials.apiHash"
              type="text"
              placeholder="abc123def456..."
              class="form-control"
            />
          </div>

          <div v-if="authMethod === 'phone'" class="form-group">
            <label>Phone Number</label>
            <input
              v-model="credentials.phoneNumber"
              type="text"
              placeholder="+380123456789"
              class="form-control"
            />
          </div>

          <div class="form-actions">
            <button @click="step = 'method'" class="btn btn-secondary">
              Back
            </button>
            <button @click="startAuth" class="btn btn-primary" :disabled="!isCredentialsValid">
              Continue
            </button>
          </div>
        </div>

        <!-- Step 3: QR Code -->
        <div v-if="step === 'qrcode'" class="auth-step">
          <h3>Scan QR Code</h3>
          <p class="help-text">Open Telegram on your phone and scan this QR code</p>

          <div v-if="qrCodeLink" class="qr-container">
            <canvas ref="qrCanvas"></canvas>
          </div>

          <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Waiting for confirmation...</span>
          </div>
        </div>

        <!-- Step 4: Enter Code -->
        <div v-if="step === 'code'" class="auth-step">
          <h3>Enter Confirmation Code</h3>
          <p class="help-text">Enter the code you received from Telegram</p>

          <div class="code-input">
            <input
              v-for="i in 5"
              :key="i"
              v-model="codeDigits[i-1]"
              @input="handleCodeInput(i-1)"
              @keydown.backspace="handleBackspace(i-1)"
              :ref="el => codeInputs[i-1] = el"
              type="text"
              maxlength="1"
              class="code-digit"
            />
          </div>

          <button @click="submitCode" class="btn btn-primary" :disabled="code.length < 5">
            Verify Code
          </button>
        </div>

        <!-- Step 5: Enter Password (2FA) -->
        <div v-if="step === 'password'" class="auth-step">
          <h3>Enter 2FA Password</h3>
          <p class="help-text">Your account has two-factor authentication enabled</p>

          <div class="form-group">
            <input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="form-control"
              @keyup.enter="submitPassword"
            />
          </div>

          <button @click="submitPassword" class="btn btn-primary" :disabled="!password">
            Submit Password
          </button>
        </div>

        <!-- Step 6: Success -->
        <div v-if="step === 'success'" class="auth-step success">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Successfully Connected!</h3>
          <p>Your Telegram account has been linked</p>

          <div v-if="userInfo" class="user-info">
            <p><strong>Name:</strong> {{ userInfo.firstName }} {{ userInfo.lastName }}</p>
            <p v-if="userInfo.username"><strong>Username:</strong> @{{ userInfo.username }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <!-- Status Messages -->
        <div v-if="statusMessage" class="status-message">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue';
import QRCode from 'qrcode';
import { TelegramCredentialService } from '@/stores/credential/telegram.service.ts'

const emit = defineEmits(['close', 'success']);

const isOpen = ref(true);
const step = ref('method'); // method, credentials, qrcode, code, password, success
const authMethod = ref('');
const loading = ref(false);
const error = ref('');
const statusMessage = ref('');

const credentials = ref({
  apiId: '',
  apiHash: '',
  phoneNumber: ''
});

const sessionId = ref('');
const qrCodeLink = ref('');
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const codeDigits = ref(['', '', '', '', '']);
const codeInputs = ref<HTMLInputElement[]>([]);
const password = ref('');
const userInfo = ref<any>(null);

let eventSource: EventSource | null = null;

const code = computed(() => codeDigits.value.join(''));

const isCredentialsValid = computed(() => {
  if (!credentials.value.apiId || !credentials.value.apiHash) {
    return false;
  }
  if (authMethod.value === 'phone' && !credentials.value.phoneNumber) {
    return false;
  }
  return true;
});

function selectMethod(method: string) {
  authMethod.value = method;
  step.value = 'credentials';
}

async function startAuth() {
  try {
    loading.value = true;
    error.value = '';

    const response = await TelegramCredentialService.startAuth({
      apiId: credentials.value.apiId,
      apiHash: credentials.value.apiHash,
      phoneNumber: credentials.value.phoneNumber || undefined,
      authMethod: authMethod.value as 'qrcode' | 'phone'
    });

    sessionId.value = response.sessionId;
    listenForUpdates();

  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to start authentication';
    loading.value = false;
  }
}

function listenForUpdates() {
  eventSource = TelegramCredentialService.createEventSource(sessionId.value);

  eventSource.onmessage = async (event) => {
    const update = JSON.parse(event.data);
    console.log('Auth update:', update);

    switch (update.type) {
      case 'status':
        statusMessage.value = update.message;
        break;

      case 'qr_code':
        console.log("update===", update)
        qrCodeLink.value = update.data.link;
        step.value = 'qrcode';
        loading.value = true;
        await nextTick();
        await generateQRCode(update.data.link);
        break;

      case 'phone_required':
        // Автоматично обробляється на бекенді
        break;

      case 'code_required':
        step.value = 'code';
        loading.value = false;
        await nextTick();
        codeInputs.value[0]?.focus();
        break;

      case 'password_required':
        step.value = 'password';
        loading.value = false;

        // Якщо це повторна спроба (невірний пароль)
        if (update.retry) {
          error.value = update.message; // "Incorrect password. Please try again."
          // Очищуємо поле паролю для повторного введення
          password.value = '';
        }

        // Показуємо підказку якщо є
        if (update.hint) {
          statusMessage.value = `Password hint: ${update.hint}`;
        }
        break;

      case 'success':
        step.value = 'success';
        loading.value = false;
        userInfo.value = update.user;

        setTimeout(() => {
          emit('success', update.credentialId);
          // handleClose();
        }, 2000);
        break;

      case 'error':
        error.value = update.message;
        loading.value = false;
        break;

      case 'closed':
        eventSource?.close();
        break;
    }
  };

  eventSource.onerror = () => {
    error.value = 'Connection lost. Please try again.';
    loading.value = false;
  };
}

async function generateQRCode(link: string) {
  console.log("Generate QR Code", !qrCanvas.value);
  if (!qrCanvas.value) return;
  console.log("Qr code link:", link);
  try {
    await QRCode.toCanvas(qrCanvas.value, link, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
  }
}

function handleCodeInput(index: number) {
  if (codeDigits.value[index] && index < 4) {
    codeInputs.value[index + 1]?.focus();
  }
}

function handleBackspace(index: number) {
  if (!codeDigits.value[index] && index > 0) {
    codeInputs.value[index - 1]?.focus();
  }
}

async function submitCode() {
  try {
    loading.value = true;
    error.value = '';

    await TelegramCredentialService.submitCode(sessionId.value, code.value);
    statusMessage.value = 'Verifying code...';
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to submit code';
    loading.value = false;
  }
}

async function submitPassword() {
  try {
    loading.value = true;
    error.value = '';

    await TelegramCredentialService.submitPassword(sessionId.value, password.value);
    statusMessage.value = 'Verifying password...';
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to submit password';
    loading.value = false;
  }
}

function handleClose() {
  if (sessionId.value) {
    TelegramCredentialService.cancelAuth(sessionId.value).catch(err => {
      console.error('Error canceling auth:', err);
    });
  }
  eventSource?.close();
  emit('close');
}

onUnmounted(() => {
  eventSource?.close();
});
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
