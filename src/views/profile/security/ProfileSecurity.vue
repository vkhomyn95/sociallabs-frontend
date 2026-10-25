<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { provideMfaSettings } from './useMfaSettings'
import { MFA_STEP_REGISTRY } from './mfa-step-registry'

/**
 * Картка двофакторної автентифікації. Сама лише обрамлення:
 * стан і дії — у useMfaSettings, кожен екран — окремий крок з MFA_STEP_REGISTRY.
 */
const { status, state, error, load } = provideMfaSettings()

interface ActiveStep {
  key: string
  component: Component
  props: Record<string, unknown>
}

// Дані кроку (усе, крім `view`) ідуть у нього як props.
const activeStep = computed<ActiveStep>(() => {
  const { view, ...props } = state.value
  return { key: view, component: MFA_STEP_REGISTRY[view], props }
})

onMounted(load)
</script>

<template>
  <section class="slb-profile__card slb-security">
    <header class="slb-profile__card-head">
      <i class="fa-solid fa-shield-halved slb-profile__card-icon"></i>
      <h2 class="slb-profile__card-title">Two-factor authentication</h2>
      <span v-if="status?.totpEnabled" class="slb-security__badge">Enabled</span>
    </header>

    <p v-if="error" class="slb-security__error" role="alert">{{ error }}</p>

    <Transition name="slb-security-step" mode="out-in">
      <component :is="activeStep.component" :key="activeStep.key" v-bind="activeStep.props" />
    </Transition>
  </section>
</template>

<style lang="scss">
@use './security.scss';
</style>
