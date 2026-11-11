<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { InstagramBotStatusResponse } from './instagramBot.types'
import { INSTAGRAM_STATUS_UI, tokenExpiresSoon } from './instagramBot.ui'

/**
 * Whether the account receives webhooks now, which account it is, how many users may be answered now, and until when
 * its token lives.
 */
const props = defineProps<{ status: InstagramBotStatusResponse }>()

const ui = computed(() => INSTAGRAM_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const account = computed(() => props.status.account ?? null)
const expiresAt = computed(() => props.status.token.expiresAt ?? null)
const expiringSoon = computed(() => tokenExpiresSoon(expiresAt.value))
</script>

<template>
  <div class="slb-instagram-summary">
    <div class="slb-instagram-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="account" class="slb-instagram-summary__account">
        <SlbIcon name="brand_instagram" :size="14" />
        @{{ account.username }}<template v-if="account.name"> · {{ account.name }}</template>
      </span>
      <span class="slb-instagram-summary__users">
        {{ status.contacts.inWindow.toLocaleString() }} in the 24 h window of {{ status.contacts.seen.toLocaleString() }}
        seen
      </span>
    </div>
    <div class="slb-instagram-summary__line">
      <SlbBadge v-if="account?.accountType" color="gray">{{ account.accountType }}</SlbBadge>
      <SlbBadge v-if="expiresAt" :color="expiringSoon ? 'warning' : 'gray'">
        Token until {{ formatMoment(expiresAt) }}
      </SlbBadge>
      <SlbBadge v-else color="gray">Token expiry known after its first renewal</SlbBadge>
    </div>
    <p class="slb-instagram-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-instagram-summary__since">
      Since {{ formatMoment(status.statusChangedAt) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.slb-instagram-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__account,
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
