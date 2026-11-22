<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbAlert, SlbBadge, SlbToggle, slbToast } from '@sociallabs/frontend-components'
import CopyableUrl from '../bot-common/CopyableUrl.vue'
import { toApiError } from '../credential-ui'
import { TikTokBotService } from './tiktokBot.service'
import { TikTokBotStatus, type TikTokBotStatusResponse } from './tiktokBot.types'
import { TIKTOK_WEBHOOK_LABELS } from './tiktokBot.ui'

/**
 * What the TikTok app and the server need: a public address, the redirect URL the app lists, the app's webhook and
 * its categories, the owner's consent to take over a webhook that points elsewhere, and the media prefix TikTok
 * verified for publishing item files. Each missing piece is called out; actions work without the webhook.
 */
const props = defineProps<{ credentialId: number; status: TikTokBotStatusResponse }>()
const emit = defineEmits<{ changed: [] }>()

const saving = ref(false)
const webhookTypes = computed(() => props.status.webhookTypes.map((type) => TIKTOK_WEBHOOK_LABELS[type] ?? type))
const foreign = computed(() => props.status.status === TikTokBotStatus.WEBHOOK_FOREIGN)

async function allowReplacing(allowed: boolean): Promise<void> {
  saving.value = true
  try {
    await TikTokBotService.allowReplacingForeignCallback(props.credentialId, allowed)
    emit('changed')
  } catch (e) {
    slbToast.error(toApiError(e, 'Could not save the choice').message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="slb-tiktok-setup">
    <SlbAlert v-if="!status.publicAddress" variant="warning" title="No public address">
      TikTok delivers events only to a webhook and redirects only to HTTPS, so the server needs a public HTTPS address
      without a port (app.public-url). Triggers receive nothing until it is set; actions still work.
    </SlbAlert>

    <SlbAlert v-if="status.accountError" variant="warning" title="TikTok did not answer">{{ status.accountError }}</SlbAlert>

    <SlbAlert v-if="foreign" variant="warning" title="The app’s webhook goes elsewhere">
      A TikTok app has one webhook. It points to another address, perhaps another integration of the same app. Allow
      replacing it to receive here; the other address then gets nothing.
    </SlbAlert>

    <div v-if="status.callbackUrl" class="slb-tiktok-setup__row">
      <span class="slb-tiktok-setup__label">Redirect URL</span>
      <CopyableUrl :url="status.callbackUrl" name="Redirect URL" />
    </div>
    <div v-if="status.webhookUrl" class="slb-tiktok-setup__row">
      <span class="slb-tiktok-setup__label">Webhook</span>
      <CopyableUrl :url="status.webhookUrl" name="Webhook address" />
    </div>
    <div v-if="webhookTypes.length" class="slb-tiktok-setup__row">
      <span class="slb-tiktok-setup__label">Webhook events</span>
      <span class="slb-tiktok-setup__badges">
        <SlbBadge v-for="type in webhookTypes" :key="type" color="gray">{{ type }}</SlbBadge>
      </span>
    </div>
    <div class="slb-tiktok-setup__row">
      <span class="slb-tiktok-setup__label">Replace a foreign webhook</span>
      <SlbToggle
        :model-value="status.replaceForeignCallback"
        :disabled="saving"
        label="Allowed for this TikTok app"
        @update:model-value="allowReplacing"
      />
    </div>
    <div class="slb-tiktok-setup__row">
      <span class="slb-tiktok-setup__label">Media for publishing</span>
      <template v-if="status.media">
        <SlbBadge :color="status.media.verified ? 'success' : 'warning'">
          {{ status.media.verified ? 'Verified by TikTok' : 'Not verified' }}
        </SlbBadge>
        <CopyableUrl :url="status.media.prefix" name="Media prefix" />
      </template>
      <span v-else class="slb-tiktok-setup__muted">
        Verified with TikTok on the first post published from a file
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb-tiktok-setup {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-sm);
    align-items: center;
    min-height: 28px;
    font-size: var(--slb-font-sm);
  }

  &__label {
    flex: 0 0 170px;
    color: var(--slb-color-text-muted);
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__muted {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }
}
</style>
