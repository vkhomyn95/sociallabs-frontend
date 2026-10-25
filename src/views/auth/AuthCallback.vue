<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AuthErrorCode, AuthStatus } from '@/stores/auth/types'

/**
 * Повернення з OAuth-провайдера: /auth/callback?ticket=… або ?error=CODE.
 * Тікет одноразовий — обмінюємо його і одразу прибираємо з адресного рядка.
 */
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const { ticket, error } = route.query

  if (typeof error === 'string' || typeof ticket !== 'string') {
    auth.failOAuth(typeof error === 'string' ? error : AuthErrorCode.OAUTH_FAILED)
    await router.replace({ name: 'Auth' })
    return
  }

  const result = await auth.completeOAuth(ticket)
  // MFA_REQUIRED і помилки показує екран входу (challenge / error вже в store).
  await router.replace(result === AuthStatus.AUTHENTICATED ? auth.consumeOAuthRedirect() : { name: 'Auth' })
})
</script>

<template>
  <div class="slb-auth-callback" role="status">
    <span class="slb-auth-callback__spinner" aria-hidden="true" />
    Signing you in…
  </div>
</template>

<style lang="scss" scoped>
.slb-auth-callback {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--slb-color-text-muted);

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid var(--slb-color-border);
    border-top-color: var(--slb-color-primary);
    border-radius: 50%;
    animation: slb-auth-spin 0.8s linear infinite;
  }
}

@keyframes slb-auth-spin {
  to { transform: rotate(360deg); }
}
</style>
