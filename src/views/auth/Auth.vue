<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlbAuthFlow } from '@sociallabs/frontend-components'
import type {
  SlbAuthErrors,
  SlbAuthProvider,
  SlbAuthStep,
  SlbLoginPayload,
  SlbMfaPayload,
  SlbRegisterPayload,
} from '@sociallabs/frontend-components'
import { safeRedirect, useAuthStore } from '@/stores/auth'
import { AuthStatus, AuthStep } from '@/stores/auth/types'
import { toAuthStep, toFlowErrors, toLoginRequest, toMfaMethod, toRegisterRequest } from './auth-flow'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Після OAuth з 2FA сюди повертає /auth/callback — challenge вже в store.
const step = ref<AuthStep>(auth.isMfaPending ? AuthStep.MFA : AuthStep.START)
// v-model:step SlbAuthFlow працює з union-ом бібліотеки — конвертуємо на межі.
const flowStep = computed<SlbAuthStep>({
  get: () => step.value,
  set: (next) => (step.value = toAuthStep(next)),
})
const email = ref<string>('')

const providers = computed<SlbAuthProvider[]>(() =>
  auth.providers.map((p): SlbAuthProvider => ({ key: p.id, label: p.name })),
)

// Поля з помилками показуються біля полів, решта — алертом над формою.
const fieldErrors = computed<SlbAuthErrors>(() => toFlowErrors(auth.fieldErrors))

const redirectTo = computed<string>(() => safeRedirect(route.query.redirect))

async function finish(result: AuthStatus | null): Promise<void> {
  switch (result) {
    case AuthStatus.AUTHENTICATED:
      await router.replace(redirectTo.value)
      break
    case AuthStatus.MFA_REQUIRED:
      step.value = AuthStep.MFA
      break
    // null — помилка вже в auth.error, форма її покаже.
  }
}

const onLogin = async (payload: SlbLoginPayload): Promise<void> =>
  finish(await auth.login(toLoginRequest(payload)))

const onRegister = async (payload: SlbRegisterPayload): Promise<void> =>
  finish(await auth.register(toRegisterRequest(payload)))

const onVerify = async (payload: SlbMfaPayload): Promise<void> =>
  finish(await auth.verifyMfa(toMfaMethod(payload.method), payload.code))

const onProvider = (key: string): void => auth.startOAuth(key, redirectTo.value)

// Challenge прострочено / вичерпано спроби — store його скинув, повертаємось на старт.
watch(() => auth.isMfaPending, (pending) => {
  if (!pending && step.value === AuthStep.MFA) step.value = AuthStep.START
})

onMounted(() => {
  auth.fetchProviders()
})
</script>

<template>
  <SlbAuthFlow
    v-model:step="flowStep"
    v-model:email="email"
    title="Welcome to SocialLabs"
    subtitle="Sign in or create an account to build your workflows"
    :providers="providers"
    :loading="auth.loading"
    :pending-provider="auth.pendingProvider"
    :error="auth.formError"
    :errors="fieldErrors"
    :forgot="false"
    @provider="onProvider"
    @login="onLogin"
    @register="onRegister"
    @verify="onVerify"
    @cancel-mfa="auth.cancelMfa"
    @clear-error="auth.clearError"
  >
    <template #legal>
      By continuing, you agree to the SocialLabs Terms of Service and Privacy Policy.
    </template>
  </SlbAuthFlow>
</template>
