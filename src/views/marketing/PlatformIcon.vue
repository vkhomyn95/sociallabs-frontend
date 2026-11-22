<script setup lang="ts">
import { SlbIcon, SlbTooltip } from '@sociallabs/frontend-components'
import { PLATFORM_META } from './marketing.mock'
import type { Platform } from './marketing.types'

defineProps<{ platform: Platform }>()
</script>

<template>
  <SlbTooltip :content="PLATFORM_META[platform].label" :arrow="false">
    <span class="mk-platform" :style="{ background: PLATFORM_META[platform].color }">
      <SlbIcon :name="PLATFORM_META[platform].icon" :size="12" color="#fff" />
    </span>
  </SlbTooltip>
</template>
