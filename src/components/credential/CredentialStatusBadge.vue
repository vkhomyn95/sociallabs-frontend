<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbTooltip } from '@sociallabs/frontend-components'
import type { CredentialStatus } from '@/stores/credential/types'
import { STATUS_UI } from './credential-ui'

const props = defineProps<{ status: CredentialStatus; message?: string | null }>()

const ui = computed(() => STATUS_UI[props.status])
</script>

<template>
  <SlbTooltip :content="message ?? undefined" :disabled="!message">
    <SlbBadge :color="ui.color" dot>{{ ui.label }}</SlbBadge>
  </SlbTooltip>
</template>
