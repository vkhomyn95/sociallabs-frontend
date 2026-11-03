<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { ViberBotStatusResponse } from './viberBot.types'
import { VIBER_STATUS_UI } from './viberBot.ui'

/** Whether the bot receives callbacks now, which bot it is, how many users it may write to, and since when. */
const props = defineProps<{ status: ViberBotStatusResponse }>()

const ui = computed(() => VIBER_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const account = computed(() => props.status.account ?? null)
</script>

<template>
  <div class="slb-viber-summary">
    <div class="slb-viber-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="account" class="slb-viber-summary__bot">
        <SlbIcon name="brand_viber" :size="14" />
        {{ account.name }}<template v-if="account.uri"> · {{ account.uri }}</template>
      </span>
      <span class="slb-viber-summary__users">
        {{ status.subscribers.subscribed.toLocaleString() }} subscribed of {{ status.subscribers.seen.toLocaleString() }} seen
      </span>
    </div>
    <p class="slb-viber-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-viber-summary__since">Since {{ formatMoment(status.statusChangedAt) }}</p>
  </div>
</template>

<style scoped lang="scss">
.slb-viber-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__bot,
  &__users {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }

  &__users {
    margin-left: auto;
  }

  &__message,
  &__since {
    margin: 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text);
  }

  &__since {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }
}
</style>
