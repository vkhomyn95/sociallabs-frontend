<script setup lang="ts">
import { SlbIcon } from '@sociallabs/frontend-components'
import { CAPABILITIES } from './telegramBot.ui'
import type { BotFacts } from './telegramBot.types'

/** What the bot may do, as set in @BotFather and found by the last check of its token. */
defineProps<{ facts: BotFacts }>()
</script>

<template>
  <ul class="slb-bot-capabilities">
    <li
      v-for="capability in CAPABILITIES"
      :key="capability.key"
      :class="{ 'is-off': !facts[capability.key] }"
    >
      <SlbIcon :name="facts[capability.key] ? 'action_check' : 'action_close'" :size="14" />
      {{ facts[capability.key] ? capability.label : capability.off }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
.slb-bot-capabilities {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-success);

    &.is-off {
      color: var(--slb-color-text-muted);
    }
  }
}
</style>
