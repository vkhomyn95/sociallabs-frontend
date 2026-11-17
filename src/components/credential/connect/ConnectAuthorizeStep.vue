<script setup lang="ts">
import { SlbButton, SlbIcon } from '@sociallabs/frontend-components'

/**
 * OAuth step: the user opens the provider's page in a popup and signs in there; the server finishes the connection on
 * the provider's redirect and reports it over the event stream, so this step only waits once the page is open.
 */
const props = defineProps<{ url: string; message: string; note?: string }>()

const POPUP_FEATURES = 'popup,width=600,height=760'

function open(): void {
  // Opened by the click itself, so popup blockers let it through; a blocked popup falls back to a new tab.
  const popup = window.open(props.url, 'slb-oauth', POPUP_FEATURES)
  if (!popup) window.open(props.url, '_blank', 'noopener')
}
</script>

<template>
  <div class="slb-cred-connect">
    <SlbIcon name="action_key" :size="32" />
    <p class="slb-cred-connect__message">{{ message }}</p>
    <p v-if="note" class="slb-cred-connect__note">{{ note }}</p>
    <SlbButton variant="primary" @click="open">Open the sign-in page</SlbButton>
    <p class="slb-cred-connect__note">This window updates on its own once you allow access.</p>
  </div>
</template>

<style scoped lang="scss">
.slb-cred-connect__note {
  margin: 0;
  font-size: var(--slb-font-sm);
  color: var(--slb-color-text-muted);
  text-align: center;
  word-break: break-all;
}
</style>
