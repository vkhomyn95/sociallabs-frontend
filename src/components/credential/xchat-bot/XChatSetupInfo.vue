<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import type { XChatBotStatusResponse } from './xchatBot.types'

/**
 * What the X app and the server need for the bot to receive: the callback URL the app lists, the webhook X posts to, a
 * public address, the app's Bearer token. Each missing piece is called out; sending works without them.
 */
defineProps<{ status: XChatBotStatusResponse }>()
</script>

<template>
  <div class="slb-xchat-setup">
    <SlbAlert v-if="!status.publicAddress" variant="warning" title="No public address">
      X delivers messages only to a webhook, which needs the server's public HTTPS address (app.public-url). Triggers
      cannot receive anything until it is set; actions still send.
    </SlbAlert>

    <SlbAlert v-if="!status.appBearer" variant="warning" title="No Bearer token">
      The bot was connected without the X app's Bearer token, which registers the webhook. Connect it again with the
      token from developer.x.com → your app → Keys and tokens to receive messages.
    </SlbAlert>

    <SlbAlert v-if="status.accountError" variant="warning" title="X did not answer">{{ status.accountError }}</SlbAlert>

    <div v-if="status.callbackUrl" class="slb-xchat-setup__row">
      <span class="slb-xchat-setup__label">Callback URL</span>
      <CopyableUrl :url="status.callbackUrl" name="Callback URL" />
    </div>
    <div v-if="status.webhookUrl" class="slb-xchat-setup__row">
      <span class="slb-xchat-setup__label">Webhook</span>
      <CopyableUrl :url="status.webhookUrl" name="Webhook address" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb-xchat-setup {
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
}
</style>
