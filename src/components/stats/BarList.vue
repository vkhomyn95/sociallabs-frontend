<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { SlbIconName } from '@sociallabs/frontend-components'

export interface BarListItem {
  label: string
  value: number
  icon?: SlbIconName
  /** Додатковий текст праворуч від значення, напр. «12% CR». */
  note?: string
}

/**
 * Горизонтальні бари «категорія → величина», відсортовані за спаданням.
 * Один ряд даних — один колір (величина), ідентичність несе підпис, не колір.
 * `tone` — status-колір для «поганих» метрик (блокування).
 */
const props = withDefaults(
  defineProps<{ items: BarListItem[]; tone?: 'primary' | 'error' | 'warning'; format?: (v: number) => string }>(),
  { tone: 'primary', format: (v: number) => v.toLocaleString() },
)

const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)))
const sorted = computed(() => [...props.items].sort((a, b) => b.value - a.value))
</script>

<template>
  <ul class="bar-list" :class="`bar-list--${tone}`">
    <li v-for="item in sorted" :key="item.label" class="bar-list__row" :title="`${item.label}: ${format(item.value)}`">
      <span class="bar-list__label">
        <SlbIcon v-if="item.icon" :name="item.icon" :size="14" />
        <span class="bar-list__text">{{ item.label }}</span>
      </span>
      <span class="bar-list__track">
        <span class="bar-list__bar" :style="{ width: `${(item.value / max) * 100}%` }" />
      </span>
      <span class="bar-list__value">
        {{ format(item.value) }}
        <span v-if="item.note" class="bar-list__note">{{ item.note }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  &--primary { --bar-color: var(--slb-color-primary); }
  &--error { --bar-color: var(--slb-color-error); }
  &--warning { --bar-color: var(--slb-color-warning); }

  &__row {
    display: grid;
    grid-template-columns: minmax(90px, 34%) 1fr auto;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    &:hover .bar-list__bar { filter: brightness(0.9); }
  }
  &__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--slb-color-gray-700);
  }
  &__text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__track { height: 8px; }
  &__bar {
    display: block;
    height: 100%;
    min-width: 2px;
    border-radius: 0 4px 4px 0;
    background: var(--bar-color);
  }
  &__value {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    text-align: right;
    color: var(--slb-color-gray-900);
  }
  &__note { margin-left: 4px; font-weight: 400; color: var(--slb-color-gray-500); }
}
</style>
