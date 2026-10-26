<script setup lang="ts">
import { SlbIcon, type SlbIconName } from '@sociallabs/frontend-components'
import { SyncStatus } from '@/core/sync/DraftSync'

defineProps<{ status: SyncStatus; error?: string | null }>()

const VIEW: Record<SyncStatus, { icon: SlbIconName; label: string; tone: 'muted' | 'busy' | 'warning' | 'error' }> = {
  [SyncStatus.SAVED]: { icon: 'action_check', label: 'Saved', tone: 'muted' },
  [SyncStatus.UNSAVED]: { icon: 'action_edit', label: 'Unsaved changes', tone: 'muted' },
  [SyncStatus.SAVING]: { icon: 'shape_spinner', label: 'Saving…', tone: 'busy' },
  [SyncStatus.RETRYING]: { icon: 'status_warning', label: 'Offline, retrying', tone: 'warning' },
  [SyncStatus.CONFLICT]: { icon: 'status_error', label: 'Changed elsewhere', tone: 'error' },
  [SyncStatus.FAILED]: { icon: 'status_error', label: 'Not saved', tone: 'error' },
}
</script>

<template>
  <span class="wf-save" :class="`wf-save--${VIEW[status].tone}`" :title="error ?? undefined" role="status">
    <SlbIcon :name="VIEW[status].icon" :size="14" />
    {{ VIEW[status].label }}
  </span>
</template>

<style scoped lang="scss">
.wf-save {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);

  &--busy {
    color: var(--slb-color-busy, var(--slb-color-primary));
  }

  &--warning {
    color: var(--slb-color-warning);
  }

  &--error {
    color: var(--slb-color-error);
  }
}
</style>
