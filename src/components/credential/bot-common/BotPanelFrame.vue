<script setup lang="ts">
import { SlbAlert, SlbButton } from '@sociallabs/frontend-components'

/** The frame of a bot's live panel under its credential form: a title with a refresh button, an error, the content. */
defineProps<{
  title: string
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{ refresh: [] }>()
</script>

<template>
  <section class="slb-bot-panel">
    <header class="slb-bot-panel__header">
      <h3 class="slb-bot-panel__title">{{ title }}</h3>
      <SlbButton variant="ghost" size="sm" icon-left="action_refresh" :loading="loading" @click="emit('refresh')">Refresh</SlbButton>
    </header>

    <SlbAlert v-if="error" variant="error">{{ error }}</SlbAlert>

    <slot />
  </section>
</template>

<style scoped lang="scss">
.slb-bot-panel {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-base);
  margin-top: var(--slb-space-lg);
  padding-top: var(--slb-space-lg);
  border-top: 1px solid var(--slb-color-border);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title,
  :slotted(.slb-bot-panel__title) {
    margin: 0;
    font-size: var(--slb-font-sm);
    font-weight: var(--slb-fw-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--slb-color-text-muted);
  }
}
</style>
