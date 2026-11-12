<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert, SlbBadge } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import type { MetaBotStatusResponse } from './metaBot.types'

/**
 * What to set in the Meta App Dashboard and whether it took: Meta takes one callback URL per app, set by hand, so the
 * address and verify token are always shown, with the platform's steps until Meta has checked the address once.
 * Whether the account is subscribed to the app, and to which fields, comes from Meta.
 */
const props = defineProps<{ status: MetaBotStatusResponse; steps: readonly string[] }>()

const subscription = computed(() => props.status.subscription ?? null)
</script>

<template>
  <div class="slb-meta-webhook">
    <SlbAlert v-if="!status.publicAddress" variant="warning" title="No public address">
      Meta delivers messages only to a webhook, which needs the server's public HTTPS address (app.public-url).
      Triggers cannot receive anything until it is set; actions still work.
    </SlbAlert>

    <SlbAlert v-if="!status.appSecret" variant="warning" title="No app secret">
      Triggers need the Meta app's secret (App settings → Basic) to check that webhooks come from Meta. Actions work
      without it.
    </SlbAlert>

    <div v-if="status.webhookUrl" class="slb-meta-webhook__row">
      <span class="slb-meta-webhook__label">Callback URL</span>
      <CopyableUrl :url="status.webhookUrl" name="Callback URL" />
      <SlbBadge :color="status.webhookVerified ? 'success' : 'warning'">
        {{ status.webhookVerified ? 'verified by Meta' : 'not verified yet' }}
      </SlbBadge>
    </div>
    <div v-if="status.verifyToken" class="slb-meta-webhook__row">
      <span class="slb-meta-webhook__label">Verify token</span>
      <CopyableUrl :url="status.verifyToken" name="Verify token" />
    </div>

    <SlbAlert v-if="!status.webhookVerified" variant="info" title="Set the webhook in your Meta app">
      <ol class="slb-meta-webhook__steps">
        <li v-for="step in steps" :key="step">{{ step }}</li>
      </ol>
    </SlbAlert>

    <SlbAlert v-if="status.accountError" variant="warning" title="Meta did not answer">
      {{ status.accountError }}
    </SlbAlert>

    <div v-else-if="subscription" class="slb-meta-webhook__row">
      <span class="slb-meta-webhook__label">Account subscribed</span>
      <SlbBadge :color="subscription.subscribed ? 'success' : 'gray'">
        {{ subscription.subscribed ? 'yes' : 'no' }}
      </SlbBadge>
      <span class="slb-meta-webhook__fields">
        <SlbBadge v-for="field in subscription.fields" :key="field" color="gray">{{ field }}</SlbBadge>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb-meta-webhook {
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

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__steps {
    margin: 0;
    padding-left: 18px;
  }
}
</style>
