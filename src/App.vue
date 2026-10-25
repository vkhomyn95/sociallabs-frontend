<template>
  <!-- Layout обирає router (батьківський маршрут): AppLayout або AuthLayout. -->
  <RouterView />

  <!-- Global modal portal — renders all modals from the store stack -->
  <ModalProvider />
  <ToastProvider />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ModalProvider from '@/components/ui/modal/ModalProvider.vue'
import ToastProvider from '@/components/ui/toast/ToastProvider.vue'
</script>
