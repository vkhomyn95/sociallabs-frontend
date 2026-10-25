// Бібліотека першою: глобальні стилі застосунку (main.scss, components/ui) мають пріоритет.
import '@sociallabs/frontend-components/styles'
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registerSessionHandlers } from '@/core/services/api'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// api.ts на 401 пробує refresh; якщо сесію не відновити — на екран входу.
const authStore = useAuthStore(pinia)
registerSessionHandlers({
  refresh: () => authStore.refresh(),
  onExpired: () => {
    authStore.clearSession()
    const current = router.currentRoute.value
    if (current.meta.requiresAuth !== false) {
      router.replace({ name: 'Auth', query: { redirect: current.fullPath } })
    }
  },
})

app.mount('#app')
