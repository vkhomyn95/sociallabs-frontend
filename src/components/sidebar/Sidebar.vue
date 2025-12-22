<template>
  <div :class="sidebarClasses">
    <div class="sidebar__header">
      <div class="sidebar__header-title">SocialLabs</div>
      <div class="sidebar__collapse-btn" @click.stop="toggleCollapse">
        <CollapseIcon />
      </div>
    </div>

    <div class="sidebar__content" ref="sidebarContentRef">
      <component
        v-for="(item, index) in menuItems"
        :is="item.component"
        :key="index"
        :class="getItemClass(item)"
        @mouseenter="(e: MouseEvent) => handleMouseEnter(e, item)"
        @mouseleave="handleMouseLeave"
      >
        <SidebarItem
          :item="item"
          :index="index"
          :is-collapsed="isCollapsed"
        />
      </component>
    </div>

    <div
      class="sidebar__footer"
      @mouseenter="(e: MouseEvent) => handleMouseEnter(e, { tooltip: 'User Profile' })"
      @mouseleave="handleMouseLeave"
    >
      <div class="sidebar__footer__profiler">
        <div class="sidebar__user-avatar">B</div>
        <div v-show="!isCollapsed" class="sidebar__user-info">
          <div class="sidebar__user-name">Volodymyr</div>
          <div class="sidebar__user-workspace">My Workspace</div>
        </div>
      </div>
      <button v-show="!isCollapsed" class="sidebar__dropdown-toggle">▼</button>
    </div>

    <Tooltip
      :show="tooltipState.show"
      :text="tooltipState.text"
      :target-element="tooltipState.targetElement"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMenuItems } from '@/components/sidebar/useMenuItems'
import SidebarItem from '@/components/sidebar/SidebarItem.vue'
import CollapseIcon from '@/components/sidebar/icons/CollapseIcon.vue'
import type { MenuItem } from './sidebar.types'
import Tooltip from '@/core/components/Tooltip.vue'

const isCollapsed = ref<boolean>(false);
const sidebarContentRef = ref<HTMLElement | null>(null);

const tooltipState = reactive<{
  show: boolean;
  text: string;
  targetElement: HTMLElement | null;
}>({
  show: false,
  text: '',
  targetElement: null
});

const { menuItems } = useMenuItems();

const sidebarClasses = computed(() => ({
  sidebar: true,
  'sidebar--collapsed': isCollapsed.value
}));

const getItemClass = (item: MenuItem): string => {
  return item.class || '';
};

const toggleCollapse = (): void => {
  isCollapsed.value = !isCollapsed.value;
};

const handleMouseEnter = (event: MouseEvent, item: MenuItem | { tooltip?: string }): void => {
  if (isCollapsed.value && item.tooltip) {
    tooltipState.show = true;
    tooltipState.text = item.tooltip;
    tooltipState.targetElement = event.currentTarget as HTMLElement;
  }
};

const handleMouseLeave = (): void => {
  tooltipState.show = false;
  tooltipState.text = '';
  tooltipState.targetElement = null;
};
</script>

<style scoped lang="scss">
@import '/src/assets/sidebar';
</style>
