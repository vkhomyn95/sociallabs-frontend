<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbAlert, SlbBadge, SlbButton, SlbIcon, slbToast } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'
import BotCountersGrid from '../bot-common/BotCountersGrid.vue'
import BotPanelFrame from '../bot-common/BotPanelFrame.vue'
import { formatMoment } from '../bot-common/botPanel'
import { useBotStatus } from '../bot-common/useBotStatus'
import { toApiError } from '../credential-ui'
import { XChatAccountService } from './xchatAccount.service'
import { ACCOUNT_COUNTERS, ACCOUNT_STATE_UI, CONNECT_AGAIN, NOT_RUNNING_UI, RECONNECTABLE } from './xchatAccount.ui'

/**
 * A connected X account for XChat: its state and why, who it is, when it last heard from X and when a pause ends,
 * what it received, a way to start it again (or what to do when only a new connection helps), and the risk.
 */
const props = defineProps<{ credential: Credential }>()

const { status, loading, error, refresh } = useBotStatus(
  () => props.credential.id,
  XChatAccountService.status,
  'Could not load the account status',
)

const reconnecting = ref(false)

const ui = computed(() => {
  const state = status.value?.state
  if (!status.value?.running || !state) return NOT_RUNNING_UI
  return ACCOUNT_STATE_UI[state]
})

/** A stopped, stuck or not running account can be started again; an ended one must be connected again. */
const canReconnect = computed(() => {
  const value = status.value
  if (!value || value.needsReconnect) return false
  if (!value.running || !value.state) return true
  return RECONNECTABLE.has(value.state)
})

/** What to do when only connecting the account again helps; null otherwise. */
const connectAgain = computed(() => {
  const value = status.value
  if (!value?.needsReconnect || !value.state) return null
  return CONNECT_AGAIN[value.state] ?? null
})

const who = computed(() => {
  const value = status.value
  if (!value) return null
  const username = value.username ? `@${value.username}` : null
  if (value.name && username) return `${value.name} · ${username}`
  return username ?? value.name ?? null
})

async function reconnect(): Promise<void> {
  reconnecting.value = true
  try {
    status.value = await XChatAccountService.reconnect(props.credential.id)
    slbToast.success('The account is connecting')
  } catch (e) {
    slbToast.error(toApiError(e, 'Could not reconnect the account').message)
  } finally {
    reconnecting.value = false
  }
}
</script>

<template>
  <BotPanelFrame title="Connected account" :loading="loading" :error="error" @refresh="refresh">
    <template v-if="status">
      <div class="slb-xc-account">
        <div class="slb-xc-account__line">
          <SlbBadge :color="ui.color" dot data-test="account-state">{{ ui.label }}</SlbBadge>
          <span v-if="who" class="slb-xc-account__who">
            <SlbIcon name="brand_x" :size="14" />
            {{ who }}
          </span>
        </div>
        <p class="slb-xc-account__hint">
          {{ ui.hint }}
          <template v-if="status.stateReason"> ({{ status.stateReason }})</template>
          <template v-if="status.stateChangedAt"> · since {{ formatMoment(status.stateChangedAt) }}</template>
        </p>
        <p v-if="status.pausedUntil" class="slb-xc-account__hint" data-test="paused-until">
          Paused until {{ formatMoment(status.pausedUntil) }}
        </p>
        <p v-if="status.running" class="slb-xc-account__hint" data-test="last-event">
          <template v-if="status.lastEventAt">Last event {{ formatMoment(status.lastEventAt) }}</template>
          <template v-else>No events since the account started</template>
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
      <SlbAlert v-if="connectAgain" variant="error" :title="connectAgain.title" data-test="connect-again">
        {{ connectAgain.text }}
      </SlbAlert>
      <BotCountersGrid v-if="status.counters" :counters="status.counters" :items="ACCOUNT_COUNTERS" />
    </template>

    <SlbAlert variant="warning" title="Risk of restrictions">
      X does not allow unofficial clients, and this server keeps the account’s session and XChat keys, which open all
      of its encrypted conversations. Automated messages can get the account restricted; the node keeps a slow,
      irregular pace, but cannot rule that out. Use a stable proxy in the account’s country, and do not connect an
      account you cannot afford to lose.
    </SlbAlert>
  </BotPanelFrame>
</template>

<style scoped lang="scss">
.slb-xc-account {
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

  &__who {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-md);
    color: var(--slb-color-text);
  }

  &__hint {
    margin: 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }
}
</style>
