<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { MetaBotStatusResponse } from './metaBot.types'
import { META_STATUS_UI, tokenExpiresSoon, type MetaBotPlatformUi } from './metaBot.ui'

/**
 * Whether the bot receives webhooks now, which account it is, how many users may be answered now, and, where tokens
 * expire, until when its token lives.
 */
const props = defineProps<{ status: MetaBotStatusResponse; platform: MetaBotPlatformUi }>()

const ui = computed(() => META_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const account = computed(() => props.status.account ?? null)
const token = computed(() => props.status.token ?? null)
const expiresAt = computed(() => token.value?.expiresAt ?? null)
const expiringSoon = computed(() => tokenExpiresSoon(expiresAt.value))
</script>

<template>
  <div class="slb-meta-summary">
    <div class="slb-meta-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="account" class="slb-meta-summary__account">
        <SlbIcon :name="platform.icon" :size="14" />
        {{ platform.accountLine(account) }}
      </span>
      <span class="slb-meta-summary__users">
        {{ status.contacts.inWindow.toLocaleString() }} in the 24 h window of {{ status.contacts.seen.toLocaleString() }}
        seen
      </span>
    </div>
    <div class="slb-meta-summary__line">
      <SlbBadge v-if="account?.type" color="gray">{{ account.type }}</SlbBadge>
      <template v-if="token">
        <SlbBadge v-if="expiresAt" :color="expiringSoon ? 'warning' : 'gray'">
          Token until {{ formatMoment(expiresAt) }}
        </SlbBadge>
        <SlbBadge v-else color="gray">Token expiry known after its first renewal</SlbBadge>
      </template>
    </div>
    <p class="slb-meta-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-meta-summary__since">
      Since {{ formatMoment(status.statusChangedAt) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.slb-meta-summary {
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
