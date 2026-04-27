<script setup lang="ts">
import Sidebar from '@/components/sidebar/Sidebar.vue'
</script>

<template>
  <div class="slb-app-layout">
    <Sidebar class="slb-app-layout__sidebar" />
    <main class="slb-app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.slb-app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &__sidebar {
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--gray-50);
  }
}
</style>
