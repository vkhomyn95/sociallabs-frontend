<script setup lang="ts">
import { COUNTERS } from './telegramBot.ui'
import type { BotCounters } from './telegramBot.types'

/** Updates the running bot has received, handled and lost since it started. */
defineProps<{ counters: BotCounters }>()
</script>

<template>
  <dl class="slb-bot-counters">
    <div v-for="counter in COUNTERS" :key="counter.key" class="slb-bot-counters__item">
      <dt>{{ counter.label }}</dt>
      <dd>{{ counters[counter.key].toLocaleString() }}</dd>
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
