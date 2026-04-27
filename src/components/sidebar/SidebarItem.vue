<template>
  <template v-if="isSection">
    <span class="slb-sidebar__section-text">{{ item.text }}</span>
  </template>

  <template v-else-if="isSpacer" />

  <template v-else-if="isMenuItem">
    <i v-if="item.iconClass" :class="[item.iconClass, 'slb-sidebar__item-icon']" />
    <span v-show="!isCollapsed" class="slb-sidebar__item-text">
      {{ item.text }}
    </span>
    <span
      v-if="item.hasDropdown && !isCollapsed"
      class="slb-sidebar__item-dropdown"
    >
      <i class="fa-solid fa-chevron-down" />
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from './sidebar.ts';

interface Props {
  item: MenuItem;
  index: number;
  isCollapsed: boolean;
}

const props = defineProps<Props>();

const isSection = computed(() => props.item.class === 'slb-sidebar__section');
const isSpacer  = computed(() => props.item.class === 'slb-sidebar__spacer');
const isMenuItem = computed(() => props.item.class?.includes('slb-sidebar__item') ?? false);
</script>
