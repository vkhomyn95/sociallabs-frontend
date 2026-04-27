<script setup lang="ts">
import { ref, reactive } from 'vue'
import SlbInput from '@/components/ui/input/SlbInput.vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'

const form   = reactive({ current: '', next: '', confirm: '' })
const errors = reactive({ current: '', next: '', confirm: '' })
const saving = ref(false)
const saved  = ref(false)

const handleSubmit = async () => {
  saving.value = true
  await new Promise(r => setTimeout(r, 900))
  saving.value = false
  saved.value  = true
  setTimeout(() => { saved.value = false }, 2800)
}
</script>

<template>
  <div class="slb-profile__card">
    <div class="slb-profile__card-head">
      <i class="fa-solid fa-lock slb-profile__card-icon"></i>
      <h2 class="slb-profile__card-title">Change Password</h2>
    </div>

    <form class="slb-profile__form" @submit.prevent="handleSubmit" novalidate>
      <SlbInput
        id="pw-current"
        v-model="form.current"
        type="password"
        label="Current Password"
        placeholder="••••••••"
        icon-left="fa-solid fa-lock"
        :error="errors.current"
        :disabled="saving"
      />
      <SlbInput
        id="pw-next"
        v-model="form.next"
        type="password"
        label="New Password"
        placeholder="Min. 8 characters"
        icon-left="fa-solid fa-lock"
        :error="errors.next"
        :disabled="saving"
      />
      <SlbInput
        id="pw-confirm"
        v-model="form.confirm"
        type="password"
        label="Confirm New Password"
        placeholder="Repeat password"
        icon-left="fa-solid fa-shield-check"
        :error="errors.confirm"
        :disabled="saving"
      />

      <div class="slb-profile__form-actions">
        <Transition name="slb-profile-fade">
          <span v-if="saved" class="slb-profile__saved-badge">
            <i class="fa-solid fa-check"></i> Updated
          </span>
        </Transition>
        <SlbButton type="submit" variant="primary" size="md" :loading="saving" :disabled="saving">
          Update Password
        </SlbButton>
      </div>
    </form>
  </div>
</template>
