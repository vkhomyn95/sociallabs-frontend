<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { SlbSidebar } from '@sociallabs/frontend-components'
import type { MenuItem, SidebarItem, SidebarUser } from '@sociallabs/frontend-components'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import {
  ACCOUNT_MENU,
  ACCOUNT_ROUTES,
  AccountAction,
  NAV,
  NAV_BOTTOM_ITEMS,
  NAV_ITEMS,
  isAccountAction,
  isNavSection,
} from './navigation'

const COLLAPSED_KEY = 'slb.sidebar.collapsed'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { logout } = useAuth()

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

const collapsed = ref<boolean>(readCollapsed())
watch(collapsed, (value) => {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
  } catch {
    // Сховище недоступне (приватний режим) — стан просто не запам'ятається.
  }
})

// Активний пункт — з meta.nav маршруту, а не з кліку: працює і для прямих посилань.
const active = computed<string | null>(() => route.meta.nav ?? null)

const user = computed<SidebarUser | null>(() =>
  auth.user
    ? { name: auth.fullName || auth.user.email, workspace: auth.user.email, avatarUrl: auth.user.avatarUrl }
    : null,
)

function onNavigate(item: SidebarItem): void {
  if (isNavSection(item.key)) router.push({ name: NAV[item.key].route })
}

function onAccount(item: MenuItem): void {
  if (!isAccountAction(item.key)) return
  if (item.key === AccountAction.LOGOUT) {
    logout()
    return
  }
  router.push({ name: ACCOUNT_ROUTES[item.key] })
}
</script>

<template>
  <div class="slb-app-layout">
    <SlbSidebar
      v-model:collapsed="collapsed"
      class="slb-app-layout__sidebar"
      title="SocialLabs"
      :model-value="active"
      :items="NAV_ITEMS"
      :bottom-items="NAV_BOTTOM_ITEMS"
      :user="user"
      :user-menu="ACCOUNT_MENU"
      @item-click="onNavigate"
      @user-select="onAccount"
    />
    <main class="slb-app-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.slb-app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  // Меню — сіре, робоча область і хедер — білі.
  &__sidebar {
    flex-shrink: 0;
    background: var(--slb-color-gray-50);
  }

  // Хедер і скрол — у PageLayout; повноекранні сторінки (редактор, діалоги) керують ними самі.
  &__main {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    background: var(--slb-color-surface);
  }
}
</style>
