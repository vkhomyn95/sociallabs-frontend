<template>
  <div :class="sidebarClasses">
    <div class="slb-sidebar__header">
      <div class="slb-sidebar__header-title">SocialLabs</div>
      <button class="slb-sidebar__collapse-btn" @click.stop="toggleCollapse">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>

    <div class="slb-sidebar__content" ref="sidebarContentRef">
      <component
        v-for="(item, index) in menuItems"
        :is="item.component"
        :key="index"
        :class="getItemClass(item)"
        @click="handleItemClick(item)"
      >
        <SidebarItem
          :item="item"
          :index="index"
          :is-collapsed="isCollapsed"
        />
      </component>
    </div>

    <div
      class="slb-sidebar__footer"
    >
      <div class="slb-sidebar__footer-profiler" @click="router.push('/profile')">
        <div class="slb-sidebar__user-avatar">B</div>
        <div v-show="!isCollapsed" class="slb-sidebar__user-info">
          <div class="slb-sidebar__user-name">Volodymyr</div>
          <div class="slb-sidebar__user-workspace">My Workspace</div>
        </div>
      </div>
      <button v-show="!isCollapsed" class="slb-sidebar__dropdown-toggle">
        <i class="fa-solid fa-chevron-down" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSidebar } from '@/components/sidebar/useSidebar'
import { useMenuItems } from '@/components/sidebar/useMenuItems'
import { useAuth } from '@/composables/useAuth'
import SidebarItem from '@/components/sidebar/SidebarItem.vue'
import type { MenuItem } from './sidebar.ts'
import { useRouter } from 'vue-router'

const router = useRouter()

const sidebarContentRef = ref<HTMLElement | null>(null);

const { isCollapsed, sidebarClasses, toggleCollapse } = useSidebar();
const { menuItems } = useMenuItems();
const { logout } = useAuth();

const getItemClass = (item: MenuItem): string => item.class || '';

const handleItemClick = (item: MenuItem): void => {
  if (item.action === 'logout') {
    logout();
  } else {
    router.push(item.action);
  }
};
</script>

<style scoped lang="scss">
@use './sidebar';
</style>
