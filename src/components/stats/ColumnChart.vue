<script setup lang="ts">
import { computed } from 'vue'

export interface ColumnPoint {
  label: string
  value: number
}

/**
 * Колонки по часу (один ряд). Підписи осі — лише кожен n-й, значення — у підказці при наведенні.
 */
const props = withDefaults(defineProps<{ points: ColumnPoint[]; unit?: string; height?: number }>(), {
  unit: '',
  height: 140,
})

const max = computed(() => Math.max(1, ...props.points.map((p) => p.value)))
const every = computed(() => Math.max(1, Math.ceil(props.points.length / 7)))
</script>

<template>
  <div class="col-chart" :style="{ '--col-h': `${height}px` }">
    <div class="col-chart__plot">
      <div
        v-for="(p, i) in points"
        :key="i"
        class="col-chart__slot"
        :title="`${p.label}: ${p.value.toLocaleString()}${unit ? ` ${unit}` : ''}`"
      >
        <span class="col-chart__bar" :style="{ height: `${(p.value / max) * 100}%` }" />
      </div>
    </div>
    <div class="col-chart__axis">
      <span v-for="(p, i) in points" :key="i">{{ i % every === 0 ? p.label : '' }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.col-chart {
  &__plot {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: var(--col-h);
    border-bottom: 1px solid var(--slb-color-gray-200);
  }
  &__slot {
    display: flex;
    flex: 1;
    align-items: flex-end;
    height: 100%;
    cursor: default;
    &:hover .col-chart__bar { background: var(--slb-color-primary-dark); }
  }
  &__bar {
    width: 100%;
    min-height: 2px;
    border-radius: 4px 4px 0 0;
    background: var(--slb-color-primary);
  }
  &__axis {
    display: flex;
    gap: 2px;
    margin-top: 6px;
    span {
      flex: 1;
      overflow: visible;
      white-space: nowrap;
      font-size: 11px;
      color: var(--slb-color-gray-500);
    }
  }
}
</style>
