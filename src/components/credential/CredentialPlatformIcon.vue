<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { CredentialPlatform } from '@/stores/credential/types'
import { platformUi } from './credential-ui'

const props = withDefaults(defineProps<{ platform: CredentialPlatform; size?: number }>(), { size: 36 })

const ui = computed(() => platformUi(props.platform))
</script>

<template>
  <span
    class="slb-cred-icon"
    :style="{ '--slb-cred-tone': `var(--slb-color-${ui.tone})`, width: `${size}px`, height: `${size}px` }"
    :title="ui.label"
  >
    <SlbIcon :name="ui.icon" :size="Math.round(size * 0.5)" />
  </span>
</template>

<style lang="scss">
.slb-cred-icon {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: var(--slb-radius-md);
  background: color-mix(in srgb, var(--slb-cred-tone) 12%, var(--slb-color-white));
  color: var(--slb-cred-tone);
}
</style>
