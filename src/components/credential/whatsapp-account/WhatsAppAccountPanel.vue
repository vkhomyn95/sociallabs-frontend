<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbAlert, SlbBadge, SlbButton, SlbIcon, slbToast } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { formatMoment } from '../bot-common/botPanel'
import { useBotStatus } from '../bot-common/useBotStatus'
import { toApiError } from '../credential-ui'
import { WhatsAppAccountService } from './whatsappAccount.service'
import { ACCOUNT_COUNTERS, ACCOUNT_STATE_UI, NOT_RUNNING_UI, RECONNECTABLE } from './whatsappAccount.ui'

/**
 * A linked WhatsApp account's connection, the number and device it was linked as, what it received, a way to start it
 * again, and a word on the risk of automating a personal account.
 */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  WhatsAppAccountService.status,
  'Could not load the account status',
)

const reconnecting = ref(false)

const ui = computed(() => {
  const state = status.value?.state
  if (!status.value?.running || !state) return NOT_RUNNING_UI
  return ACCOUNT_STATE_UI[state]
})

/** A stopped or not running account can be started again; an unlinked or banned one must be linked again. */
const canReconnect = computed(() => {
  const value = status.value
  if (!value) return false
  if (!value.running || !value.state) return true
  return RECONNECTABLE.has(value.state)
})

const phone = computed(() => {
  const number = status.value?.phoneNumber
  return number ? `+${number}` : null
})

async function reconnect(): Promise<void> {
  reconnecting.value = true
  try {
    status.value = await WhatsAppAccountService.reconnect(props.credential.id)
    slbToast.success('The account is connecting')
  } catch (e) {
    slbToast.error(toApiError(e, 'Could not reconnect the account').message)
  } finally {
    reconnecting.value = false
  }
}
</script>

<template>
  <BotPanelFrame title="Linked account" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <div class="slb-wa-account">
        <div class="slb-wa-account__line">
          <SlbBadge :color="ui.color" dot data-test="account-state">{{ ui.label }}</SlbBadge>
          <span v-if="phone" class="slb-wa-account__number">
            <SlbIcon name="brand_whatsapp" :size="14" />
            <template v-if="status.name">{{ status.name }} · </template>{{ phone }}
          </span>
          <span v-if="status.deviceName" class="slb-wa-account__device">as “{{ status.deviceName }}”</span>
        </div>
        <p class="slb-wa-account__hint">
          {{ ui.hint }}
          <template v-if="status.stateReason"> ({{ status.stateReason }})</template>
          <template v-if="status.stateChangedAt"> · since {{ formatMoment(status.stateChangedAt) }}</template>
        </p>
        <SlbButton
          v-if="canReconnect"
          variant="secondary"
          size="sm"
          icon-left="action_refresh"
          :loading="reconnecting"
          data-test="reconnect"
          @click="reconnect"
        >
          Reconnect
        </SlbButton>
      </div>
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="ACCOUNT_COUNTERS" />
    </template>

    <SlbAlert variant="warning" title="Risk of a ban">
      WhatsApp does not allow unofficial clients. Automation and bulk sending can get the account banned; the node keeps
      a slow, irregular pace, but cannot rule a ban out. Do not link a number you cannot afford to lose.
    </SlbAlert>
  </BotPanelFrame>
</template>

<style scoped lang="scss">
.slb-wa-account {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);
  align-items: flex-start;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-sm);
    align-items: center;
  }

  &__number {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-md);
    color: var(--slb-color-text);
  }

  &__device,
  &__hint {
    margin: 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }
}
</style>
