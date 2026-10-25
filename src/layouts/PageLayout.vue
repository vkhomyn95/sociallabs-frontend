<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './AppHeader.vue'
</script>

<!-- Звичайна сторінка: хедер із breadcrumb і прокручувана область під ним. -->
<template>
  <div class="slb-page-layout">
    <AppHeader />
    <div class="slb-page-layout__content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.slb-page-layout {
  display: flex;
  flex-direction: column;
  height: 100%;

  // Обмежена висота: сторінка може тягнутись на всю висоту і скролити лише свою частину (таблицю).
  &__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
