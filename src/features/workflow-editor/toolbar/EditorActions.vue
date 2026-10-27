<script setup lang="ts">
import { SlbButton } from '@sociallabs/frontend-components'
import { SyncStatus } from '@/core/sync/DraftSync'
import SaveIndicator from './SaveIndicator.vue'
import type { ToolbarState } from './toolbarState'

/** The editor's actions in the workflow header: save state, undo and redo, execute, publish, activate. */
const props = defineProps<{ state: ToolbarState }>()

const emit = defineEmits<{
  undo: []
  redo: []
  publish: []
  toggleActive: []
  execute: []
  reload: []
}>()

/** Saving stopped: the draft changed elsewhere or the server refused it, so only a reload helps. */
const blocked = (): boolean => props.state.status === SyncStatus.CONFLICT || props.state.status === SyncStatus.FAILED
</script>

<template>
  <SaveIndicator :status="state.status" :error="state.error" />
  <SlbButton v-if="blocked()" variant="secondary" size="sm" icon-left="action_refresh" @click="emit('reload')">Reload</SlbButton>
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
  <SlbButton variant="success" size="sm" icon-left="action_bolt" :loading="state.executing" @click="emit('execute')">Execute</SlbButton>
  <SlbButton
    variant="secondary"
    size="sm"
    icon-left="action_upload"
    :loading="state.publishing"
    :disabled="!state.hasUnpublishedChanges || blocked()"
    :title="state.hasUnpublishedChanges ? 'Publish the draft as a new version' : 'The active version equals the draft'"
    @click="emit('publish')"
  >
    Publish
  </SlbButton>
  <SlbButton variant="primary" size="sm" @click="emit('toggleActive')">{{ state.active ? 'Deactivate' : 'Activate' }}</SlbButton>
</template>
