<script setup lang="ts">
import { reactive } from 'vue'
import ProfileAvatar   from './ProfileAvatar.vue'
import ProfileBilling  from './ProfileBilling.vue'
import ProfileInfo     from './ProfileInfo.vue'
import ProfilePassword from './ProfilePassword.vue'
import type { QuotaItem } from './ProfileBilling.vue'

const user = reactive({
  firstName:    'Volodymyr',
  lastName:     'Bondarenko',
  email:        'volodymyr@example.com',
  avatarLetter: 'V',
})

const billing = reactive({
  plan:     'Pro',
  renewsAt: 'May 19, 2026',
})

const quotas: QuotaItem[] = [
  { icon: 'fa-solid fa-bolt-lightning', label: 'Executions', used: 840,  total: 1000 },
  { icon: 'fa-solid fa-hexagon-nodes',  label: 'Workflows',  used: 7,    total: 10   },
  { icon: 'fa-solid fa-bolt',           label: 'Triggers',   used: 14,   total: 20   },
]
</script>

<template>
  <div class="slb-profile">

    <div class="slb-profile__header">
      <h1 class="slb-profile__title">Profile &amp; Billing</h1>
      <p class="slb-profile__subtitle">Manage your account information and monitor usage quotas.</p>
    </div>

    <div class="slb-profile__grid">

      <!-- Left column -->
      <div class="slb-profile__col">
        <ProfileAvatar
          :avatar-letter="user.avatarLetter"
          :first-name="user.firstName"
          :last-name="user.lastName"
          :email="user.email"
          :plan="billing.plan"
        />
        <ProfileBilling
          :plan="billing.plan"
          :renews-at="billing.renewsAt"
          :quotas="quotas"
        />
      </div>

      <!-- Right column -->
      <div class="slb-profile__col">
        <ProfileInfo
          :first-name="user.firstName"
          :last-name="user.lastName"
          :email="user.email"
        />
        <ProfilePassword />
      </div>

    </div>
  </div>
</template>

<style lang="scss">
@use './profile.scss';
</style>
