<script setup lang="ts">
import { ref, reactive } from 'vue'
import SlbInput from '@/components/ui/input/SlbInput.vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'

const props = defineProps<{
  firstName: string
  lastName: string
  email: string
}>()

const form = reactive({
  firstName: props.firstName,
  lastName:  props.lastName,
  email:     props.email,
})
const errors  = reactive({ firstName: '', lastName: '', email: '' })
const saving  = ref(false)
const saved   = ref(false)

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
      <i class="fa-regular fa-user slb-profile__card-icon"></i>
      <h2 class="slb-profile__card-title">Personal Information</h2>
    </div>

    <form class="slb-profile__form" @submit.prevent="handleSubmit" novalidate>
      <div class="slb-profile__field-row">
        <SlbInput
          id="profile-first"
          v-model="form.firstName"
          label="First Name"
          placeholder="John"
          icon-left="fa-regular fa-user"
          :error="errors.firstName"
          :disabled="saving"
        />
        <SlbInput
          id="profile-last"
          v-model="form.lastName"
          label="Last Name"
          placeholder="Doe"
          icon-left="fa-regular fa-user"
          :error="errors.lastName"
          :disabled="saving"
        />
      </div>

      <SlbInput
        id="profile-email"
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        icon-left="fa-regular fa-envelope"
        :error="errors.email"
        :disabled="saving"
      />

      <div class="slb-profile__form-actions">
        <Transition name="slb-profile-fade">
          <span v-if="saved" class="slb-profile__saved-badge">
            <i class="fa-solid fa-check"></i> Saved
          </span>
        </Transition>
        <SlbButton type="submit" variant="primary" size="sm" :loading="saving" :disabled="saving">
          Save Changes
        </SlbButton>
      </div>
    </form>
  </div>
</template>
