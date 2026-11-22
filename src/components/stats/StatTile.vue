<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { SlbIconName } from '@sociallabs/frontend-components'

/**
 * KPI-плитка: підпис, велике число, зміна до попереднього періоду.
 * `goodWhenDown` — для метрик, де зростання погане (блокування, помилки).
 */
const props = defineProps<{
  label: string
  value: string | number
  icon?: SlbIconName
  /** Зміна у відсотках до попереднього періоду. */
  delta?: number
  goodWhenDown?: boolean
  hint?: string
}>()

const display = computed(() => (typeof props.value === 'number' ? props.value.toLocaleString() : props.value))

const trend = computed(() => {
  if (props.delta === undefined || props.delta === 0) return null
  const up = props.delta > 0
  const good = up !== !!props.goodWhenDown
  return { up, good, text: `${up ? '+' : ''}${props.delta}%` }
})
</script>

<template>
  <div class="stat-tile">
    <span class="stat-tile__label">
      <SlbIcon v-if="icon" :name="icon" :size="14" />
      {{ label }}
    </span>
    <span class="stat-tile__value">{{ display }}</span>
    <span class="stat-tile__foot">
      <span v-if="trend" class="stat-tile__delta" :class="trend.good ? 'is-good' : 'is-bad'">
        <SlbIcon :name="trend.up ? 'arrow_up' : 'arrow_down'" :size="12" />
        {{ trend.text }}
      </span>
      <span v-if="hint" class="stat-tile__hint">{{ hint }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-lg);
  background: var(--slb-color-white);

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--slb-color-gray-500);
  }
  &__value {
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    color: var(--slb-color-gray-900);
  }
  &__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 16px;
    font-size: 12px;
  }
  &__delta {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 500;
    &.is-good { color: var(--slb-color-success); }
    &.is-bad { color: var(--slb-color-error); }
  }
  &__hint { color: var(--slb-color-gray-500); }
}
</style>
