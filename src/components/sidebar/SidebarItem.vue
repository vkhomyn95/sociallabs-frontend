<template>
  <!-- Section -->
  <template v-if="isSection">
    <span class="sidebar__section-text">{{ item.text }}</span>
  </template>

  <!-- Spacer -->
  <template v-else-if="isSpacer">
    <!-- Порожній блок для spacer -->
  </template>

  <!-- Menu Item -->
  <template v-else-if="isMenuItem">
    <component
      v-if="item.icon"
      class="sidebar__item-icon"
      :is="item.icon"
    />
    <span v-show="!isCollapsed" class="sidebar__item-text">
      {{ item.text }}
    </span>
    <span
      v-if="item.hasDropdown && !isCollapsed"
      class="sidebar__item-dropdown"
    >
      ⌄
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from './sidebar.types';

interface Props {
  item: MenuItem;
  index: number;
  isCollapsed: boolean;
}

const props = defineProps<Props>();

const isSection = computed((): boolean => {
  return props.item.class === 'sidebar__section';
});

const isSpacer = computed((): boolean => {
  return props.item.class === 'sidebar__spacer';
});

const isMenuItem = computed((): boolean => {
  return props.item.class?.includes('sidebar__item') ?? false;
});
</script>
