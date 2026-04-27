<script setup lang="ts">
defineProps<{
  avatarLetter: string
  firstName: string
  lastName: string
  email: string
  plan: string
}>()
</script>

<template>
  <div class="slb-profile__card slb-profile__card--avatar">

    <!-- Avatar circle -->
    <div class="slb-profile__avatar-wrap">
      <div class="slb-profile__avatar">{{ avatarLetter }}</div>
      <button class="slb-profile__avatar-btn" aria-label="Change avatar">
        <i class="fa-solid fa-camera"></i>
      </button>
    </div>

    <!-- Name + email + badge — inline on mobile -->
    <div class="slb-profile__avatar-info">
      <span class="slb-profile__avatar-name">{{ firstName }} {{ lastName }}</span>
      <span class="slb-profile__avatar-email">{{ email }}</span>
      <div class="slb-profile__plan-badge">
        <i class="fa-solid fa-bolt"></i> {{ plan }}
      </div>
    </div>

  </div>
</template>
