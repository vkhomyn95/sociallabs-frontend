<script setup lang="ts">
import { SlbInput, SlbToggle } from '@sociallabs/frontend-components'
import type { SendingSettings } from './sending'

/**
 * Спільний для всіх кампаній блок «від яких акаунтів і як обережно»:
 * ротація акаунтів, денний ліміт, випадкова затримка, робочі години, автопауза.
 */
defineProps<{ step: number; limitLabel: string }>()
const settings = defineModel<SendingSettings>({ required: true })
</script>

<template>
  <div class="mk-form__group">
    <span class="mk-form__label">{{ step }} · Accounts & limits</span>
    <span class="mk-form__hint">Accounts rotate — the load is split between the enabled ones:</span>
    <SlbToggle v-for="acc in settings.accounts" :key="acc.name" v-model="acc.on" :label="acc.name" />
    <div class="mk-form__row">
      <SlbInput v-model="settings.perAccountDay" type="number" :label="limitLabel" />
      <SlbInput v-model="settings.hours" label="Working hours" />
    </div>
    <div class="mk-form__row">
      <SlbInput v-model="settings.delayMin" type="number" label="Random delay from, sec" />
      <SlbInput v-model="settings.delayMax" type="number" label="Random delay to, sec" />
    </div>
    <SlbToggle v-model="settings.stopOnFlood" label="Pause an account on FLOOD_WAIT / spam block, continue with others" />
    <slot />
  </div>
</template>
