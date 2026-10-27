<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge } from '@sociallabs/frontend-components'
import { ExecutionStatus } from '@/core/execution/types'
import { STATUS } from '../presentation'

const props = defineProps<{ status: ExecutionStatus }>()

const presentation = computed(() => STATUS[props.status])
</script>

<template>
  <SlbBadge
    :color="presentation.color"
    :prefix-icon="presentation.icon"
    size="sm"
    class="wf-exec-status"
    :class="{ 'wf-exec-status--running': status === ExecutionStatus.RUNNING }"
  >
    {{ presentation.label }}
  </SlbBadge>
</template>

<style scoped lang="scss">
.wf-exec-status--running :deep(svg) {
  animation: wf-exec-spin 1s linear infinite;
}

@keyframes wf-exec-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
