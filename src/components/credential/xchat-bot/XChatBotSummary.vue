<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbIcon } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { XChatBotStatusResponse } from './xchatBot.types'
import { XCHAT_STATUS_UI } from './xchatBot.ui'

/** Whether the bot receives messages now, which X account it is, whether its XChat key is registered, and since when. */
const props = defineProps<{ status: XChatBotStatusResponse }>()

const ui = computed(() => XCHAT_STATUS_UI[props.status.status])
const message = computed(() => props.status.statusMessage || ui.value.hint)
const account = computed(() => props.status.account ?? null)
</script>

<template>
  <div class="slb-xchat-summary">
    <div class="slb-xchat-summary__line">
      <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
      <span v-if="account" class="slb-xchat-summary__bot">
        <SlbIcon name="brand_x" :size="14" />
        @{{ account.username }}
      </span>
      <SlbBadge v-if="account" :color="account.keysRegistered ? 'success' : 'error'" class="slb-xchat-summary__keys">
        {{ account.keysRegistered ? `XChat key ${account.keyVersion}` : 'XChat key not registered' }}
      </SlbBadge>
    </div>
    <p class="slb-xchat-summary__message">{{ message }}</p>
    <p v-if="status.statusChangedAt" class="slb-xchat-summary__since">Since {{ formatMoment(status.statusChangedAt) }}</p>
  </div>
</template>

<style scoped lang="scss">
.slb-xchat-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__line {
    display: flex;
    flex-wrap: wrap;
    gap: var(--slb-space-base);
    align-items: center;
  }

  &__bot {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }

  &__keys {
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
