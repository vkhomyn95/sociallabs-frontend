<script setup lang="ts">
import { useRoute } from 'vue-router'
import { SlbIcon } from '@sociallabs/frontend-components'

// Заглушка для розділів меню, які ще не реалізовані; заголовок — з meta.title маршруту.
const route = useRoute()
</script>

<template>
  <section class="slb-coming-soon">
    <SlbIcon name="object_box" :size="32" class="slb-coming-soon__icon" />
    <h1 class="slb-coming-soon__title">{{ route.meta.title }}</h1>
    <p class="slb-coming-soon__text">This section is under construction.</p>
  </section>
</template>

<style scoped lang="scss">
.slb-coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--slb-space-sm);
  height: 100%;
  color: var(--slb-color-gray-500);

  &__icon { color: var(--slb-color-gray-400); }
  &__title { margin: 0; font-size: 18px; font-weight: 600; color: var(--slb-color-gray-900); }
  &__text { margin: 0; font-size: 14px; }
}
</style>
