<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SlbAuthLayout } from '@sociallabs/frontend-components'
</script>

<template>
  <!-- Спільна оболонка екранів входу: бренд зверху, контент по центру. -->
  <SlbAuthLayout brand="SocialLabs">
    <RouterView />
  </SlbAuthLayout>
</template>
