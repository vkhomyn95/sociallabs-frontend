<template>
  <component :is="layout">
    <RouterView />
  </component>

  <!-- Global modal portal — renders all modals from the store stack -->
  <ModalProvider />
  <ToastProvider />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { LayoutType } from '@/layouts/layout.types'
import ModalProvider from '@/components/ui/modal/ModalProvider.vue'
import ToastProvider from '@/components/ui/toast/ToastProvider.vue'

const route = useRoute()

const layout = computed(() =>
  route.meta.layout === LayoutType.Auth ? AuthLayout : AppLayout
)
</script>
