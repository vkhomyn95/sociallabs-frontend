<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import SlbInput from '@/components/ui/input/SlbInput.vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import SlbCheckbox from '@/components/ui/checkbox/SlbCheckbox.vue'
import SlbTab from '@/components/ui/tab/SlbTab.vue'
import type { TabItem } from '@/components/ui/tab/useTab'
import { useAuth } from '@/composables/useAuth.ts'

type SocialProvider = 'google' | 'github'

const {
  login,
  register,
  isLoading,
  error,
  loginErrors,
  registerErrors,
  clearErrors,
} = useAuth()

const activeTab = ref<string>('login')

const tabs: TabItem[] = [
  { key: 'login',    label: 'Sign In' },
  { key: 'register', label: 'Sign Up' },
]

const loginForm = reactive({ email: '', password: '', remember: false })
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const onTabChange = (key: string): void => {
  clearErrors()
  loginForm.email = ''
  loginForm.password = ''
  loginForm.remember = false
  registerForm.firstName = ''
  registerForm.lastName = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

const handleLogin = async (): Promise<void> => {
  await login({ email: loginForm.email, password: loginForm.password })
}

const handleRegister = async (): Promise<void> => {
  await register({
    firstName: registerForm.firstName,
    lastName: registerForm.lastName,
    email: registerForm.email,
    password: registerForm.password,
    confirmPassword: registerForm.confirmPassword,
  } as any)
}

const handleForgotPassword = (): void => {
  console.log('Forgot password')
}

const handleSocialLogin = (provider: SocialProvider): void => {
  console.log(`Social login: ${provider}`)
}

onMounted(() => clearErrors())
</script>

<template>
  <div class="slb-auth">

    <!-- ── Left decorative panel ─────────────────────────────────────────── -->
    <div class="slb-auth__panel" aria-hidden="true">
      <div class="slb-auth__panel-brand">
        <span class="slb-auth__brand-name">SocialLabs</span>
      </div>

      <div class="slb-auth__panel-copy">
        <h2 class="slb-auth__panel-headline">
          Automate.<br />Orchestrate.<br />Scale.
        </h2>
        <p class="slb-auth__panel-sub">
          Build powerful AI agent workflows without writing a line of code.
        </p>
      </div>

      <div class="slb-auth__panel-dots">
        <span v-for="n in 9" :key="n" class="slb-auth__panel-dot"></span>
      </div>
    </div>

    <!-- ── Right: form column ────────────────────────────────────────────── -->
    <div class="slb-auth__form-col">
      <div class="slb-auth__form-wrap">

        <!-- Mobile brand -->
        <div class="slb-auth__mobile-brand">
          <div class="slb-auth__mobile-logo">S</div>
          <span class="slb-auth__mobile-name">SocialLabs</span>
        </div>

        <!-- Tabs — використовуємо наш SlbTab з variant="auth" -->
        <SlbTab
          v-model="activeTab"
          :tabs="tabs"
          variant="auth"
          @change="onTabChange"
        >
          <!-- ── LOGIN panel ─────────────────────────────────────────────── -->
          <template #login>
            <Transition name="slb-auth-fade">
              <div v-if="error" class="slb-auth__alert" role="alert">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ error }}</span>
                <button type="button" class="slb-auth__alert-close" aria-label="Close" @click="clearErrors">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </Transition>

            <form class="slb-auth__form" @submit.prevent="handleLogin" novalidate>

              <SlbInput
                id="login-email"
                v-model="loginForm.email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                icon-left="fa-regular fa-envelope"
                autocomplete="email"
                :disabled="isLoading"
                :error="loginErrors.email"
                required
              />

              <SlbInput
                id="login-password"
                v-model="loginForm.password"
                type="password"
                label="Password"
                placeholder="••••••••"
                icon-left="fa-solid fa-lock"
                autocomplete="current-password"
                :disabled="isLoading"
                :error="loginErrors.password"
                required
              />

              <div class="slb-auth__form-footer">
                <SlbCheckbox
                  v-model="loginForm.remember"
                  label="Remember me"
                  :disabled="isLoading"
                />
                <a href="#" class="slb-auth__forgot" @click.prevent="handleForgotPassword">
                  Forgot password?
                </a>
              </div>

              <SlbButton
                type="submit"
                variant="primary"
                size="md"
                :loading="isLoading"
                :disabled="isLoading"
                full
              >
                Sign In
              </SlbButton>

              <div class="slb-auth__or-divider">
                <span>or continue with</span>
              </div>

              <div class="slb-auth__social">
                <SlbButton
                  variant="secondary"
                  size="md"
                  icon-left="fa-brands fa-google"
                  :disabled="isLoading"
                  full
                  @click="handleSocialLogin('google')"
                >
                  Google
                </SlbButton>
                <SlbButton
                  variant="secondary"
                  size="md"
                  icon-left="fa-brands fa-github"
                  :disabled="isLoading"
                  full
                  @click="handleSocialLogin('github')"
                >
                  GitHub
                </SlbButton>
              </div>

            </form>
          </template>

          <!-- ── REGISTER panel ─────────────────────────────────────────── -->
          <template #register>
            <Transition name="slb-auth-fade">
              <div v-if="error" class="slb-auth__alert" role="alert">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ error }}</span>
                <button type="button" class="slb-auth__alert-close" aria-label="Close" @click="clearErrors">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </Transition>

            <form class="slb-auth__form" @submit.prevent="handleRegister" novalidate>

              <div class="slb-auth__field-row">
                <SlbInput
                  id="reg-first-name"
                  v-model="registerForm.firstName"
                  type="text"
                  label="First Name"
                  placeholder="John"
                  icon-left="fa-regular fa-user"
                  autocomplete="given-name"
                  :disabled="isLoading"
                  :error="registerErrors.firstName"
                  required
                />
                <SlbInput
                  id="reg-last-name"
                  v-model="registerForm.lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  icon-left="fa-regular fa-user"
                  autocomplete="family-name"
                  :disabled="isLoading"
                  :error="registerErrors.lastName"
                />
              </div>

              <SlbInput
                id="reg-email"
                v-model="registerForm.email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                icon-left="fa-regular fa-envelope"
                autocomplete="email"
                :disabled="isLoading"
                :error="registerErrors.email"
                required
              />

              <SlbInput
                id="reg-password"
                v-model="registerForm.password"
                type="password"
                label="Password"
                placeholder="Min. 8 characters"
                icon-left="fa-solid fa-lock"
                autocomplete="new-password"
                :disabled="isLoading"
                :error="registerErrors.password"
                required
              />

              <SlbInput
                id="reg-confirm"
                v-model="registerForm.confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Repeat password"
                icon-left="fa-solid fa-shield-check"
                autocomplete="new-password"
                :disabled="isLoading"
                :error="registerErrors.confirmPassword"
                required
              />

              <SlbButton
                type="submit"
                variant="primary"
                size="md"
                :loading="isLoading"
                :disabled="isLoading"
                full
              >
                Create Account
              </SlbButton>

            </form>
          </template>
        </SlbTab>

      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use './auth.scss';
</style>
