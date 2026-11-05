<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { WhatsAppBotStatusResponse } from './whatsappBot.types'
import { WHATSAPP_STATUS_UI, qualityColor } from './whatsappBot.ui'

/**
 * Whether the number receives webhooks now, which number it is with Meta's quality rating and limit tier, how many users
 * may get free-form messages now, and since when.
 */
const props = defineProps<{ status: WhatsAppBotStatusResponse }>()

const ui = computed(() => WHATSAPP_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const number = computed(() => props.status.number ?? null)
</script>

<template>
  <div class="slb-whatsapp-summary">
    <div class="slb-whatsapp-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="number" class="slb-whatsapp-summary__number">
        <SlbIcon name="brand_whatsapp" :size="14" />
        <template v-if="number.verifiedName">{{ number.verifiedName }} · </template>{{ number.displayPhoneNumber }}
      </span>
      <span class="slb-whatsapp-summary__users">
        {{ status.contacts.inWindow.toLocaleString() }} in the 24 h window of {{ status.contacts.seen.toLocaleString() }}
        seen
      </span>
    </div>
    <div v-if="number" class="slb-whatsapp-summary__line">
      <SlbBadge v-if="number.qualityRating" :color="qualityColor(number.qualityRating)">
        Quality {{ number.qualityRating }}
      </SlbBadge>
      <SlbBadge v-if="number.messagingLimitTier" color="gray">{{ number.messagingLimitTier }}</SlbBadge>
      <SlbBadge v-if="number.status" color="gray">{{ number.status }}</SlbBadge>
    </div>
    <p class="slb-whatsapp-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-whatsapp-summary__since">
      Since {{ formatMoment(status.statusChangedAt) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.slb-whatsapp-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__number,
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
