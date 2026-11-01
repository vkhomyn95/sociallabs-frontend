<script setup lang="ts">
import { SlbIcon } from '@sociallabs/frontend-components'
import { ChoiceMode } from './choiceMode'

/** How a loaded-choices field is filled, from the list or by typing ids, and a button to load the list again. */
defineProps<{
  mode: ChoiceMode
  /** Whether the list can be reloaded: a credential is selected. */
  canReload: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  'update:mode': [mode: ChoiceMode]
  reload: []
}>()
</script>

<template>
  <div class="wf-choice-bar">
    <div class="wf-choice-bar__mode" role="group" aria-label="How to choose">
      <button type="button" :class="{ active: mode === ChoiceMode.LIST }" @click="emit('update:mode', ChoiceMode.LIST)">
        From list
      </button>
      <button type="button" :class="{ active: mode === ChoiceMode.ID }" @click="emit('update:mode', ChoiceMode.ID)">
        By ID
      </button>
    </div>
    <button
      v-if="mode === ChoiceMode.LIST && canReload"
      type="button"
      class="wf-choice-bar__refresh"
      :disabled="loading"
      title="Reload the list"
      @click="emit('reload')"
    >
      <SlbIcon name="action_refresh" :size="13" :class="{ spinning: loading }" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.wf-choice-bar {
  display: flex;
  gap: 6px;
  align-items: center;
}

.wf-choice-bar__mode {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-sm);

  button {
    padding: 1px 8px;
    font-size: 11px;
    color: var(--slb-color-text-muted);
    background: none;
    border: 0;
    cursor: pointer;

    &.active {
      color: var(--slb-color-primary);
      background: var(--slb-color-primary-light, var(--slb-color-gray-100));
    }
  }
}

.wf-choice-bar__refresh {
  display: inline-flex;
  padding: 2px;
  color: var(--slb-color-text-muted);
  background: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  .spinning {
    animation: wf-choice-spin 0.8s linear infinite;
  }
}

@keyframes wf-choice-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
