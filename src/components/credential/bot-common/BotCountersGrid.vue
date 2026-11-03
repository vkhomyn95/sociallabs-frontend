<script setup lang="ts" generic="K extends string">
import type { CounterItem } from './botPanel'

/** What the running bot has received, handled and lost since it started. */
defineProps<{
  counters: Readonly<Record<K, number>>
  items: readonly CounterItem<K>[]
}>()
</script>

<template>
  <dl class="slb-bot-counters">
    <div v-for="item in items" :key="item.key" class="slb-bot-counters__item">
      <dt>{{ item.label }}</dt>
      <dd>{{ counters[item.key].toLocaleString() }}</dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
.slb-bot-counters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--slb-space-sm);
  margin: 0;

  &__item {
    padding: 6px 10px;
    background: var(--slb-color-gray-50);
    border-radius: var(--slb-radius-sm);
  }

  dt {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  dd {
    margin: 0;
    font-size: var(--slb-font-base);
    font-weight: var(--slb-fw-semibold);
    color: var(--slb-color-text);
  }
}
</style>
