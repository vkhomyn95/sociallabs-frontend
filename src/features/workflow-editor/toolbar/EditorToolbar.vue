<script setup lang="ts">
import { ref, watch } from 'vue'
import { SlbBadge, SlbButton } from '@sociallabs/frontend-components'
import { SyncStatus } from '@/core/sync/DraftSync'
import SaveIndicator from './SaveIndicator.vue'

export interface ToolbarState {
  name: string
  active: boolean
  hasUnpublishedChanges: boolean
  status: SyncStatus
  error: string | null
  canUndo: boolean
  canRedo: boolean
  undoLabel?: string
  redoLabel?: string
  publishing: boolean
  executing: boolean
}

const props = defineProps<{ state: ToolbarState }>()

const emit = defineEmits<{
  back: []
  rename: [name: string]
  undo: []
  redo: []
  publish: []
  toggleActive: []
  execute: []
  reload: []
}>()

const name = ref(props.state.name)
watch(
  () => props.state.name,
  (value) => (name.value = value),
)

function commitName(): void {
  const value = name.value.trim()
  if (value && value !== props.state.name) emit('rename', value)
  else name.value = props.state.name
}

const blocked = (status: SyncStatus) => status === SyncStatus.CONFLICT || status === SyncStatus.FAILED
</script>

<template>
  <header class="wf-toolbar">
    <div class="wf-toolbar__side">
      <SlbButton variant="ghost" size="sm" icon-only icon-left="arrow_back" title="Back to workflows" @click="emit('back')" />
      <input
        v-model="name"
        class="wf-toolbar__name"
        aria-label="Workflow name"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
        @blur="commitName"
      />
      <SlbBadge :color="state.active ? 'success' : 'gray'" dot>{{ state.active ? 'Active' : 'Inactive' }}</SlbBadge>
      <SaveIndicator :status="state.status" :error="state.error" />
      <SlbButton v-if="blocked(state.status)" variant="secondary" size="sm" icon-left="action_refresh" @click="emit('reload')">
        Reload
      </SlbButton>
    </div>

    <div class="wf-toolbar__side">
      <SlbButton
        variant="ghost"
        size="sm"
        icon-only
        icon-left="action_undo"
        :disabled="!state.canUndo"
        :title="state.undoLabel ? `Undo ${state.undoLabel} (Ctrl+Z)` : 'Undo (Ctrl+Z)'"
        @click="emit('undo')"
      />
      <SlbButton
        variant="ghost"
        size="sm"
        icon-only
        icon-left="action_redo"
        :disabled="!state.canRedo"
        :title="state.redoLabel ? `Redo ${state.redoLabel} (Ctrl+Shift+Z)` : 'Redo (Ctrl+Shift+Z)'"
        @click="emit('redo')"
      />
      <SlbButton variant="success" size="sm" icon-left="action_bolt" :loading="state.executing" @click="emit('execute')">
        Execute
      </SlbButton>
      <SlbButton
        variant="secondary"
        size="sm"
        icon-left="action_upload"
        :loading="state.publishing"
        :disabled="!state.hasUnpublishedChanges || blocked(state.status)"
        :title="state.hasUnpublishedChanges ? 'Publish the draft as a new version' : 'The active version equals the draft'"
        @click="emit('publish')"
      >
        Publish
      </SlbButton>
      <SlbButton variant="primary" size="sm" @click="emit('toggleActive')">
        {{ state.active ? 'Deactivate' : 'Activate' }}
      </SlbButton>
    </div>
  </header>
</template>

<style scoped lang="scss">
.wf-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: var(--slb-color-surface, #fff);
  border-bottom: 1px solid var(--slb-color-border);
}

.wf-toolbar__side {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.wf-toolbar__name {
  min-width: 120px;
  max-width: 320px;
  padding: 4px 8px;
  font: inherit;
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-text);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--slb-radius-sm);

  &:hover,
  &:focus {
    border-color: var(--slb-color-border);
    outline: none;
  }
}
</style>
