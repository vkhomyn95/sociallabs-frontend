<script setup lang="ts">
import { SlbBadge } from '@sociallabs/frontend-components'
import type { CredentialTypeDescriptor } from '@/stores/credential/types'
import CredentialPlatformIcon from './CredentialPlatformIcon.vue'

defineProps<{ types: CredentialTypeDescriptor[] }>()
const emit = defineEmits<{ select: [descriptor: CredentialTypeDescriptor] }>()
</script>

<template>
  <div class="slb-cred-types">
    <button
      v-for="descriptor in types"
      :key="descriptor.type"
      type="button"
      class="slb-cred-types__item"
      :disabled="!descriptor.available"
      @click="emit('select', descriptor)"
    >
      <CredentialPlatformIcon :platform="descriptor.platform" />
      <span>
        <span class="slb-cred-types__name">
          {{ descriptor.displayName }}
          <SlbBadge v-if="!descriptor.available" color="gray">Soon</SlbBadge>
        </span>
        <p class="slb-cred-types__desc">{{ descriptor.description }}</p>
      </span>
    </button>
  </div>
</template>

<style lang="scss">
.slb-cred-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--slb-space-base);

  &__item {
    display: flex;
    align-items: flex-start;
    gap: var(--slb-space-base);
    padding: var(--slb-space-base);
    border: 1px solid var(--slb-color-border);
    border-radius: var(--slb-radius-lg);
    background: var(--slb-color-surface);
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: border-color var(--slb-transition), box-shadow var(--slb-transition);

    &:hover:not(:disabled),
    &:focus-visible {
      border-color: var(--slb-color-primary);
      box-shadow: 0 0 0 3px var(--slb-color-primary-ring);
      outline: none;
    }
    &:disabled { cursor: not-allowed; opacity: 0.55; }
  }
  &__name {
    display: flex;
    align-items: center;
    gap: var(--slb-space-sm);
    font-size: var(--slb-font-base);
    font-weight: var(--slb-fw-semibold);
    color: var(--slb-color-gray-900);
  }
  &__desc {
    margin: 2px 0 0;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-text-muted);
  }
}
</style>
