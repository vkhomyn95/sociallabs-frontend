<script setup lang="ts">
import { SlbBadge } from '@sociallabs/frontend-components'
import { formatMoment } from '../bot-common/botPanel'
import type { TikTokBotContact } from './tiktokBot.types'

/**
 * The people who wrote last, with their 48 h window: TikTok lets the account answer only them, and within the window
 * (three more messages after it closes).
 */
defineProps<{ contacts: TikTokBotContact[] }>()
</script>

<template>
  <div class="slb-tiktok-contacts">
    <h4 class="slb-tiktok-contacts__title">Who wrote last</h4>
    <p v-if="!contacts.length" class="slb-tiktok-contacts__muted">
      Nobody yet; people show here once a trigger of this bot received their message.
    </p>
    <ul v-else class="slb-tiktok-contacts__list">
      <li v-for="contact in contacts" :key="contact.conversationId ?? contact.lastInboundAt">
        <span class="slb-tiktok-contacts__name">{{ contact.username ? `@${contact.username}` : 'Unknown' }}</span>
        <SlbBadge :color="contact.windowOpen ? 'success' : 'gray'">
          {{ contact.windowOpen ? 'Window open' : 'Window closed' }}
        </SlbBadge>
        <SlbBadge v-if="contact.isFollower" color="sky">Follower</SlbBadge>
        <span class="slb-tiktok-contacts__muted">
          wrote {{ formatMoment(contact.lastInboundAt) }} · {{ contact.sentSince }} sent since
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.slb-tiktok-contacts {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-sm);

  &__title {
    margin: 0;
    font-size: var(--slb-font-sm);
    font-weight: 600;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      flex-wrap: wrap;
      gap: var(--slb-space-sm);
      align-items: center;
      font-size: var(--slb-font-sm);
    }
  }

  &__name {
    min-width: 120px;
  }

  &__muted {
    margin: 0;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }
}
</style>
