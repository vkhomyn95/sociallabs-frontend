<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SlbAlert } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import { toApiError } from '../credential-ui'
import { TikTokBotService } from './tiktokBot.service'
import type { TikTokBotSetupResponse } from './tiktokBot.types'

/**
 * Steps in the customer's TikTok app before connecting a bot. The redirect URL comes first: TikTok's authorization URL
 * names it, so the app must list it before that URL is copied into the form.
 */
const setup = ref<TikTokBotSetupResponse | null>(null)
const error = ref<string | null>(null)
const request = new AbortController()

onMounted(async () => {
  try {
    setup.value = await TikTokBotService.setup(request.signal)
  } catch (e) {
    if (!request.signal.aborted) error.value = toApiError(e, 'Could not load the redirect URL').message
  }
})
onBeforeUnmount(() => request.abort())
</script>

<template>
  <div class="slb-tiktok-guide">
    <ol class="slb-tiktok-guide__steps">
      <li>
        At <strong>business-api.tiktok.com → My Apps</strong>, create an app (or open yours) and add the
        <strong>TikTok Accounts</strong> permission with the scopes the bot needs: messages, comments, publishing,
        insights, mentions.
      </li>
      <li>
        Add this redirect URL to the app’s <strong>TikTok account holder redirect URLs</strong> and activate it:
        <CopyableUrl v-if="setup?.callbackUrl" :url="setup.callbackUrl" name="Redirect URL" />
      </li>
      <li>
        For direct messages, apply for <strong>Business Messaging</strong>: TikTok reviews the app (data security and
        privacy), and the account needs Advanced Access or a Verified Business Account. Accounts registered in the EEA,
        Switzerland or the UK cannot use direct messages.
      </li>
      <li>
        Copy the <strong>App ID</strong>, the <strong>Secret</strong> and the <strong>TikTok account holder
        authorization URL</strong> from Basic Information below, then connect and authorize as the business account.
      </li>
    </ol>

    <SlbAlert v-if="error" variant="error">{{ error }}</SlbAlert>
    <SlbAlert v-else-if="setup && !setup.publicAddress" variant="warning" title="No public address">
      TikTok redirects only to HTTPS without a port, so the server needs app.public-url set to such an address
      <template v-if="setup.configuredUrl"> (now {{ setup.configuredUrl }})</template>. Connecting cannot finish
      until it is.
    </SlbAlert>
  </div>
</template>

<style scoped lang="scss">
.slb-tiktok-guide {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);

  &__steps {
    display: flex;
    flex-direction: column;
    gap: var(--slb-space-sm);
    margin: 0;
    padding-left: 18px;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text);
  }
}
</style>
