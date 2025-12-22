<template>
  <div class="login">
    <div class="login__container">
      <!-- Logo -->
      <div class="login__logo">
        <div class="login__logo-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <h1 class="login__logo-text">WorkflowHub</h1>
      </div>

      <!-- Error Alert -->
      <Transition name="fade">
        <div v-if="error" class="login__alert login__alert--error">
          <i class="fas fa-exclamation-circle login__alert-icon"></i>
          <span>{{ error }}</span>
          <button
            class="login__alert-close"
            @click="clearErrors"
            type="button"
          >
            ×
          </button>
        </div>
      </Transition>

      <!-- Tabs -->
      <div class="login__tabs">
        <button
          type="button"
          :class="['login__tab', { 'login__tab--active': activeTab === 'login' }]"
          @click="switchTab('login')"
        >
          Sign In
        </button>
        <button
          type="button"
          :class="['login__tab', { 'login__tab--active': activeTab === 'register' }]"
          @click="switchTab('register')"
        >
          Sign Up
        </button>
      </div>

      <!-- Login Form -->
      <form
        v-show="activeTab === 'login'"
        class="login__form"
        @submit.prevent="handleLogin"
        novalidate
      >
        <div class="login__field">
          <label class="login__label" for="email">Email</label>
          <div class="login__input-wrapper">
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              class="login__input"
              :class="{ 'login__input--error': loginErrors.email }"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="isLoading"
            />
          </div>
          <Transition name="fade">
            <span v-if="loginErrors.email" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ loginErrors.email }}
            </span>
          </Transition>
        </div>

        <div class="login__field">
          <label class="login__label" for="password">Password</label>
          <div class="login__input-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="login__input login__input--password"
              :class="{ 'login__input--error': loginErrors.password }"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="isLoading"
            />
            <i
              :class="[
                'fas',
                showPassword ? 'fa-eye-slash' : 'fa-eye',
                'login__input-icon'
              ]"
              @click="togglePasswordVisibility"
            ></i>
          </div>
          <Transition name="fade">
            <span v-if="loginErrors.password" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ loginErrors.password }}
            </span>
          </Transition>
        </div>

        <div class="login__row">
          <div class="login__checkbox">
            <input
              id="remember"
              v-model="loginForm.remember"
              type="checkbox"
              :disabled="isLoading"
            />
            <label for="remember">Remember me</label>
          </div>
          <a href="#" class="login__forgot" @click.prevent="handleForgotPassword">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          class="login__button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="login__spinner"></span>
          <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Register Form -->
      <form
        v-show="activeTab === 'register'"
        class="login__form"
        @submit.prevent="handleRegister"
        novalidate
      >
        <div class="login__field">
          <label class="login__label" for="reg-name">Full Name</label>
          <input
            id="reg-name"
            v-model="registerForm.firstName"
            type="text"
            class="login__input"
            :class="{ 'login__input--error': registerErrors.firstName }"
            placeholder="John Doe"
            autocomplete="name"
            :disabled="isLoading"
          />
          <Transition name="fade">
            <span v-if="registerErrors.firstName" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.firstName }}
            </span>
          </Transition>
        </div>

        <div class="login__field">
          <label class="login__label" for="reg-name">Full Name</label>
          <input
            id="reg-name"
            v-model="registerForm.lastName"
            type="text"
            class="login__input"
            :class="{ 'login__input--error': registerErrors.lastName }"
            placeholder="John Doe"
            autocomplete="name"
            :disabled="isLoading"
          />
          <Transition name="fade">
            <span v-if="registerErrors.lastName" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.lastName }}
            </span>
          </Transition>
        </div>

        <div class="login__field">
          <label class="login__label" for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="registerForm.email"
            type="email"
            class="login__input"
            :class="{ 'login__input--error': registerErrors.email }"
            placeholder="you@example.com"
            autocomplete="email"
            :disabled="isLoading"
          />
          <Transition name="fade">
            <span v-if="registerErrors.email" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.email }}
            </span>
          </Transition>
        </div>

        <div class="login__field">
          <label class="login__label" for="reg-password">Password</label>
          <div class="login__input-wrapper">
            <input
              id="reg-password"
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="login__input login__input--password"
              :class="{ 'login__input--error': registerErrors.password }"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="isLoading"
            />
            <i
              :class="[
                'fas',
                showPassword ? 'fa-eye-slash' : 'fa-eye',
                'login__input-icon'
              ]"
              @click="togglePasswordVisibility"
            ></i>
          </div>
          <Transition name="fade">
            <span v-if="registerErrors.password" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.password }}
            </span>
          </Transition>
        </div>

        <div class="login__field">
          <label class="login__label" for="reg-confirm-password">
            Confirm Password
          </label>
          <div class="login__input-wrapper">
            <input
              id="reg-confirm-password"
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="login__input login__input--password"
              :class="{ 'login__input--error': registerErrors.confirmPassword }"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="isLoading"
            />
          </div>
          <Transition name="fade">
            <span v-if="registerErrors.confirmPassword" class="login__error">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.confirmPassword }}
            </span>
          </Transition>
        </div>

        <button
          type="submit"
          class="login__button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="login__spinner"></span>
          <span>{{ isLoading ? 'Creating account...' : 'Create Account' }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="login__divider">
        <span>or continue with</span>
      </div>

      <!-- Social Login -->
      <div class="login__social">
        <button
          type="button"
          class="login__social-button"
          @click="handleSocialLogin('google')"
          :disabled="isLoading"
        >
          <i class="fab fa-google"></i>
          <span>Google</span>
        </button>
        <button
          type="button"
          class="login__social-button"
          @click="handleSocialLogin('github')"
          :disabled="isLoading"
        >
          <i class="fab fa-github"></i>
          <span>GitHub</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth.ts';

// Types
type TabType = 'login' | 'register';
type SocialProvider = 'google' | 'github';

// Composables
const {
  login,
  register,
  isLoading,
  error,
  loginErrors,
  registerErrors,
  clearErrors
} = useAuth();

// State
const activeTab = ref<TabType>('login');
const showPassword = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
});

const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Methods
const switchTab = (tab: TabType): void => {
  activeTab.value = tab;
  clearErrors();
  resetForms();
};

const resetForms = (): void => {
  loginForm.email = '';
  loginForm.password = '';
  loginForm.remember = false;

  registerForm.firstName = '';
  registerForm.lastName = '';
  registerForm.email = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
};

const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async (): Promise<void> => {
  await login({
    email: loginForm.email,
    password: loginForm.password
  });
};

const handleRegister = async (): Promise<void> => {
  await register({
    firstName: registerForm.firstName,
    lastName: registerForm.lastName,
    email: registerForm.email,
    password: registerForm.password,
    confirmPassword: registerForm.confirmPassword
  } as any);
};

const handleForgotPassword = (): void => {
  // TODO: Implement forgot password functionality
  console.log('Forgot password clicked');
};

const handleSocialLogin = (provider: SocialProvider): void => {
  // TODO: Implement social login
  console.log(`Social login with ${provider}`);
};

// Lifecycle
onMounted(() => {
  clearErrors();
});
</script>

<style lang="scss" scoped>
@import '/src/assets/auth';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
