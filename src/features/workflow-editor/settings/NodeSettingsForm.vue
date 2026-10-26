<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbToggle, type SelectOption } from '@sociallabs/frontend-components'
import { OnError, type NodeSettings } from '@/core/workflow/model'

/**
 * Engine-level behaviour of a node, the same for every type: error handling, retries, timeout and
 * output options, plus the disabled flag and notes.
 */
const props = defineProps<{
  settings: NodeSettings | null
  disabled: boolean
  notes: string | null
}>()

const emit = defineEmits<{
  'update:settings': [settings: NodeSettings]
  'update:disabled': [disabled: boolean]
  'update:notes': [notes: string | null]
}>()

const DEFAULTS: NodeSettings = { onError: OnError.STOP_WORKFLOW, alwaysOutputData: false, executeOnce: false }
const MAX_TRIES = 10

const current = computed<NodeSettings>(() => ({ ...DEFAULTS, ...props.settings }))

const ON_ERROR_LABELS: Record<OnError, string> = {
  [OnError.STOP_WORKFLOW]: 'Stop the workflow',
  [OnError.CONTINUE]: 'Continue with the input items',
  [OnError.ERROR_OUTPUT]: 'Route to an error output',
}
const onErrorOptions: SelectOption[] = Object.values(OnError).map((value) => ({ value, label: ON_ERROR_LABELS[value] }))

function patch(changes: Partial<NodeSettings>): void {
  emit('update:settings', { ...current.value, ...changes })
}

const retries = computed(() => (current.value.maxTries ?? 1) > 1)

function setRetries(on: boolean): void {
  patch(on ? { maxTries: 3, retryDelayMs: current.value.retryDelayMs ?? 1000 } : { maxTries: null, retryDelayMs: null, retryMultiplier: null })
}

const toInt = (text: string, min: number, max = Number.MAX_SAFE_INTEGER): number | null => {
  const value = Math.round(Number(text))
  return text.trim() === '' || !Number.isFinite(value) ? null : Math.min(max, Math.max(min, value))
}

const timeoutSeconds = computed(() => (current.value.timeoutMs ? current.value.timeoutMs / 1000 : null))

function setTimeoutSeconds(text: string): void {
  const seconds = toInt(text, 1)
  patch({ timeoutMs: seconds === null ? null : seconds * 1000 })
}
</script>

<template>
  <div class="wf-settings">
    <SlbToggle :model-value="disabled" label="Disabled" description="Skipped when the workflow runs; items pass through" @update:model-value="emit('update:disabled', $event)" />

    <SlbSelect
      label="On error"
      size="sm"
      :model-value="current.onError ?? OnError.STOP_WORKFLOW"
      :options="onErrorOptions"
      @update:model-value="patch({ onError: ($event as OnError | null) ?? OnError.STOP_WORKFLOW })"
    />

    <SlbToggle :model-value="retries" label="Retry on fail" @update:model-value="setRetries" />
    <div v-if="retries" class="wf-settings__row">
      <SlbInput
        label="Max tries"
        type="number"
        size="sm"
        :model-value="current.maxTries ?? 3"
        @update:model-value="patch({ maxTries: toInt($event, 2, MAX_TRIES) ?? 2 })"
      />
      <SlbInput
        label="Wait between tries (ms)"
        type="number"
        size="sm"
        :model-value="current.retryDelayMs ?? 0"
        @update:model-value="patch({ retryDelayMs: toInt($event, 0) })"
      />
    </div>

    <SlbInput
      label="Timeout (seconds)"
      type="number"
      size="sm"
      placeholder="Engine default"
      :model-value="timeoutSeconds"
      @update:model-value="setTimeoutSeconds"
    />

    <SlbToggle
      :model-value="current.alwaysOutputData"
      label="Always output data"
      description="Emit one empty item when the node produced nothing"
      @update:model-value="patch({ alwaysOutputData: $event })"
    />
    <SlbToggle
      :model-value="current.executeOnce"
      label="Execute once"
      description="Run with the first input item only"
      @update:model-value="patch({ executeOnce: $event })"
    />

    <label class="wf-settings__notes">
      <span>Notes</span>
      <textarea
        :value="notes ?? ''"
        rows="3"
        placeholder="Visible to everyone editing this workflow"
        @change="emit('update:notes', ($event.target as HTMLTextAreaElement).value.trim() || null)"
      />
    </label>
  </div>
</template>

<style scoped lang="scss">
.wf-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-settings__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wf-settings__notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-medium);

  textarea {
    padding: 8px 10px;
    font: inherit;
    font-weight: normal;
    color: var(--slb-color-text);
    border: 1px solid var(--slb-color-border);
    border-radius: var(--slb-radius-md);
    resize: vertical;

    &:focus {
      border-color: var(--slb-color-primary);
      outline: none;
    }
  }
}
</style>
