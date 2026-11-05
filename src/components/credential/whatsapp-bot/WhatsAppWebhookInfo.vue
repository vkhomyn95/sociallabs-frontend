<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert, SlbBadge } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import { WhatsAppBotStatus, type WhatsAppBotStatusResponse } from './whatsappBot.types'

/**
 * Where Meta posts the number's webhooks and whether that is here. The server sets the number's own address when a
 * trigger starts; when Meta does not take it, the address and verify token are shown to set by hand in the App
 * Dashboard. A server without a public address or a credential without the app secret receive nothing; both are called
 * out.
 */
const props = defineProps<{ status: WhatsAppBotStatusResponse }>()

const webhook = computed(() => props.status.webhook ?? null)
const elsewhere = computed(() => !!webhook.value?.effective && !webhook.value.here)
const manual = computed(() => props.status.status === WhatsAppBotStatus.WEBHOOK_UNVERIFIED)
</script>

<template>
  <div class="slb-whatsapp-webhook">
    <SlbAlert v-if="!status.publicAddress" variant="warning" title="No public address">
      Meta delivers messages only to a webhook, which needs the server's public HTTPS address (app.public-url).
      Triggers cannot receive anything until it is set; actions still send.
    </SlbAlert>

    <SlbAlert v-if="!status.appSecret" variant="warning" title="No app secret">
      Triggers need the Meta app's secret (App settings → Basic) to check that webhooks come from Meta. Actions work
      without it.
    </SlbAlert>

    <div v-if="status.webhookUrl" class="slb-whatsapp-webhook__row">
      <span class="slb-whatsapp-webhook__label">This server's address</span>
      <CopyableUrl :url="status.webhookUrl" name="Webhook address" />
    </div>
    <div v-if="manual && status.verifyToken" class="slb-whatsapp-webhook__row">
      <span class="slb-whatsapp-webhook__label">Verify token</span>
      <CopyableUrl :url="status.verifyToken" name="Verify token" />
    </div>

    <SlbAlert v-if="status.accountError" variant="warning" title="Meta did not answer">{{ status.accountError }}</SlbAlert>

    <template v-else-if="webhook">
      <div class="slb-whatsapp-webhook__row">
        <span class="slb-whatsapp-webhook__label">Meta posts to</span>
        <CopyableUrl v-if="webhook.effective" :url="webhook.effective" name="Current address" />
        <span v-else class="slb-whatsapp-webhook__none">No address</span>
        <SlbBadge v-if="webhook.here" color="success">here</SlbBadge>
      </div>
      <div class="slb-whatsapp-webhook__row">
        <span class="slb-whatsapp-webhook__label">Set for</span>
        <span class="slb-whatsapp-webhook__levels">
          <SlbBadge :color="webhook.phoneNumber ? 'primary' : 'gray'">Number</SlbBadge>
          <SlbBadge :color="webhook.businessAccount ? 'primary' : 'gray'">Business account</SlbBadge>
          <SlbBadge :color="webhook.application ? 'primary' : 'gray'">App</SlbBadge>
        </span>
      </div>

      <SlbAlert v-if="elsewhere" variant="info">
        Meta posts this number's webhooks to another address; the number's own address is set to this server's when a
        trigger starts listening.
      </SlbAlert>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slb-whatsapp-webhook {
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

  &__levels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__none {
    color: var(--slb-color-text-muted);
  }
}
</style>
