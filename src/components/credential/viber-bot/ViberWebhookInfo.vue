<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert, SlbBadge } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import type { ViberBotStatusResponse } from './viberBot.types'

/**
 * The bot's webhook as Viber reports it, and whether it points here. Viber delivers only by webhook, so a server
 * without a public HTTPS address, or a webhook set elsewhere, means triggers receive nothing; both are called out.
 */
const props = defineProps<{ status: ViberBotStatusResponse }>()

const account = computed(() => props.status.account ?? null)
const elsewhere = computed(() => !!account.value?.webhook && !account.value.webhookHere)
</script>

<template>
  <div class="slb-viber-webhook">
    <SlbAlert v-if="!status.publicAddress" variant="warning" title="No public address">
      Viber delivers messages only to a webhook, which needs the server's public HTTPS address (app.public-url).
      Triggers cannot receive anything until it is set; actions still send.
    </SlbAlert>

    <SlbAlert v-if="status.accountError" variant="warning" title="Viber did not answer">{{ status.accountError }}</SlbAlert>

    <template v-else-if="account">
      <div class="slb-viber-webhook__row">
        <span class="slb-viber-webhook__label">Webhook</span>
        <CopyableUrl v-if="account.webhook" :url="account.webhook" name="Webhook address" />
        <span v-else class="slb-viber-webhook__none">Not set</span>
      </div>
      <div v-if="account.eventTypes.length" class="slb-viber-webhook__row">
        <span class="slb-viber-webhook__label">Events</span>
        <span class="slb-viber-webhook__events">
          <SlbBadge v-for="event in account.eventTypes" :key="event" color="gray">{{ event }}</SlbBadge>
        </span>
      </div>
      <div class="slb-viber-webhook__row">
        <span class="slb-viber-webhook__label">Subscribers in Viber</span>
        <span>{{ account.subscribersCount.toLocaleString() }}</span>
      </div>

      <SlbAlert v-if="elsewhere" variant="info">
        The webhook points to another address; it is replaced with this server's when a trigger starts listening.
      </SlbAlert>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slb-viber-webhook {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);

  &__row {
    display: flex;
    gap: var(--slb-space-sm);
    align-items: center;
    min-height: 28px;
    font-size: var(--slb-font-sm);
  }

  &__label {
    flex: 0 0 150px;
    color: var(--slb-color-text-muted);
  }

  &__events {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__none {
    color: var(--slb-color-text-muted);
  }
}
</style>
