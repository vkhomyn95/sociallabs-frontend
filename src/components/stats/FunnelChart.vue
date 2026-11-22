<script setup lang="ts">
import { computed } from 'vue'

export interface FunnelStep {
  label: string
  value: number
}

/** Воронка: ширина — частка від першого кроку, праворуч — конверсія з попереднього кроку. */
const props = defineProps<{ steps: FunnelStep[] }>()

const rows = computed(() => {
  const top = Math.max(1, props.steps[0]?.value ?? 1)
  return props.steps.map((s, i) => {
    const prev = props.steps[i - 1]?.value
    return {
      ...s,
      width: Math.max(1.5, (s.value / top) * 100),
      step: prev ? `${((s.value / prev) * 100).toFixed(1)}%` : '',
    }
  })
})
</script>

<template>
  <ol class="funnel">
    <li v-for="r in rows" :key="r.label" class="funnel__row" :title="`${r.label}: ${r.value.toLocaleString()}`">
      <span class="funnel__label">{{ r.label }}</span>
      <span class="funnel__track"><span class="funnel__bar" :style="{ width: `${r.width}%` }" /></span>
      <span class="funnel__value">{{ r.value.toLocaleString() }}</span>
      <span class="funnel__step">{{ r.step }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.funnel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  &__row {
    display: grid;
    grid-template-columns: 130px 1fr 64px 52px;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
  &__label { color: var(--slb-color-gray-700); }
  &__track { height: 20px; }
  &__bar {
    display: block;
    height: 100%;
    border-radius: 0 4px 4px 0;
    background: color-mix(in srgb, var(--slb-color-primary) 75%, var(--slb-color-white));
  }
  &__row:hover &__bar { background: var(--slb-color-primary); }
  &__value {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    text-align: right;
    color: var(--slb-color-gray-900);
  }
  &__step { font-size: 12px; text-align: right; color: var(--slb-color-gray-500); }
}
</style>
