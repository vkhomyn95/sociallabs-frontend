<script setup lang="ts">
// Біла картка-секція з заголовком для графіків і таблиць на сторінках статистики.
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <section class="stat-card">
    <header class="stat-card__head">
      <div>
        <h2 class="stat-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="stat-card__sub">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.stat-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-lg);
  background: var(--slb-color-white);

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  &__title { margin: 0; font-size: 14px; font-weight: 600; color: var(--slb-color-gray-900); }
  &__sub { margin: 2px 0 0; font-size: 12px; color: var(--slb-color-gray-500); }
}
</style>
