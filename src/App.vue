<template>
  <!-- Layout обирає router (батьківський маршрут): AppLayout або AuthLayout. -->
  <RouterView />

  <SlbToastProvider />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SlbToastProvider } from '@sociallabs/frontend-components'
</script>
