<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  used: number
  total: number
}>()

const pct = computed(() => Math.min(100, Math.round((props.used / props.total) * 100)))

const barClass = computed(() => {
  if (pct.value >= 90) return 'slb-profile__meter-bar--danger'
  if (pct.value >= 70) return 'slb-profile__meter-bar--warning'
  return ''
})
</script>

<template>
  <div class="slb-profile__meter">
    <div class="slb-profile__meter-head">
      <div class="slb-profile__meter-label">
        <i :class="icon"></i> {{ label }}
      </div>
      <div
        class="slb-profile__meter-count"
        :class="{ 'slb-profile__meter-count--danger': pct >= 90 }"
      >
        {{ used.toLocaleString() }} / {{ total.toLocaleString() }}
      </div>
    </div>
    <div class="slb-profile__meter-track">
      <div
        class="slb-profile__meter-bar"
        :class="barClass"
        :style="{ width: pct + '%' }"
      />
    </div>
    <div class="slb-profile__meter-sub">{{ total - used }} remaining</div>
  </div>
</template>
