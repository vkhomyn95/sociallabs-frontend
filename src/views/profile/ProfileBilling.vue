<script setup lang="ts">
import SlbButton from '@/components/ui/button/SlbButton.vue'
import ProfileMeter from './ProfileMeter.vue'

export interface QuotaItem {
  icon: string
  label: string
  used: number
  total: number
}

defineProps<{
  plan: string
  renewsAt: string
  quotas: QuotaItem[]
}>()
</script>

<template>
  <div class="slb-profile__card">
    <div class="slb-profile__card-head">
      <i class="fa-solid fa-chart-bar slb-profile__card-icon"></i>
      <h2 class="slb-profile__card-title">Usage &amp; Quotas</h2>
    </div>

    <p class="slb-profile__renews">
      <i class="fa-regular fa-calendar"></i>
      Resets on <strong>{{ renewsAt }}</strong>
    </p>

    <ProfileMeter
      v-for="q in quotas"
      :key="q.label"
      :icon="q.icon"
      :label="q.label"
      :used="q.used"
      :total="q.total"
    />

    <SlbButton variant="secondary" size="md" full>
      <i class="fa-solid fa-arrow-up-right-from-square"></i> Upgrade Plan
    </SlbButton>
  </div>
</template>
