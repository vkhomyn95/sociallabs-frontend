<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { TikTokBotStatusResponse } from './tiktokBot.types'
import {
  REAUTHORIZE_WARNING_DAYS,
  TIKTOK_BOT_STATUS_UI,
  TIKTOK_CAPABILITIES,
  TIKTOK_CAPABILITY_LABELS,
  daysUntil,
} from './tiktokBot.ui'

/**
 * Whether the bot receives events now and since when, which TikTok account it is, what the account can do (and what
 * each missing capability lacks), and when the owner must authorize it again.
 */
const props = defineProps<{ status: TikTokBotStatusResponse }>()

const ui = computed(() => TIKTOK_BOT_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const account = computed(() => props.status.account ?? null)
const handle = computed(() => {
  const value = account.value
  if (!value) return null
  return value.username ? `@${value.username}` : (value.displayName ?? value.openId)
})
const capabilities = computed(() =>
  TIKTOK_CAPABILITIES.map((capability) => ({
    capability,
    label: TIKTOK_CAPABILITY_LABELS[capability],
    granted: account.value?.capabilities.includes(capability) ?? false,
    missing: account.value?.missing[capability] ?? [],
  })),
)
const daysLeft = computed(() => daysUntil(props.status.reauthorizeBy))
</script>

<template>
  <div class="slb-tiktok-summary">
    <div class="slb-tiktok-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="handle" class="slb-tiktok-summary__bot">
        <SlbIcon name="brand_tiktok" :size="14" />
        {{ handle }}
      </span>
    </div>
    <p class="slb-tiktok-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-tiktok-summary__muted">
      Since {{ formatMoment(status.statusChangedAt) }}
    </p>

    <ul v-if="account" class="slb-tiktok-summary__capabilities">
      <li v-for="item in capabilities" :key="item.capability" :title="item.missing.join(', ')">
        <SlbBadge :color="item.granted ? 'success' : 'gray'">{{ item.label }}</SlbBadge>
        <span v-if="!item.granted && item.missing.length" class="slb-tiktok-summary__muted">
          needs {{ item.missing.join(', ') }}
        </span>
      </li>
    </ul>

    <p class="slb-tiktok-summary__muted" :class="{ 'slb-tiktok-summary__warn': daysLeft < REAUTHORIZE_WARNING_DAYS }">
      Authorize again by {{ formatMoment(status.reauthorizeBy) }}
      <template v-if="daysLeft >= 0">({{ daysLeft }} days left)</template>
      <template v-else>(expired)</template>
    </p>
  </div>
</template>

<style scoped lang="scss">
.slb-tiktok-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__bot {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }

  &__message {
    margin: 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text);
  }

  &__capabilities {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: var(--slb-space-sm) 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      gap: var(--slb-space-sm);
      align-items: center;
    }
  }

  &__muted {
    margin: 0;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  &__warn {
    color: var(--slb-color-warning);
  }
}
</style>
