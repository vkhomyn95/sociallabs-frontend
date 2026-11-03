<script setup lang="ts" generic="B extends RowButton & { text?: string }">
import { SlbIcon } from '@sociallabs/frontend-components'
import { KeyboardType } from './keyboard.types'
import { samePosition, type ButtonGrid, type GridPosition, type RowButton } from './buttonGrid'
import type { ButtonKind } from './buttonKinds'

/**
 * The keyboard as Telegram lays it out: inline buttons under a message, or a reply keyboard in place of the user's.
 * Buttons are picked for editing here; "+" adds one to a row, "Add row" a row below.
 */
defineProps<{
  grid: ButtonGrid<B>
  kind: ButtonKind<B>
  selected: GridPosition | null
  hasIssue: (position: GridPosition) => boolean
}>()

const emit = defineEmits<{
  select: [position: GridPosition]
  append: [row: number]
  appendRow: []
}>()

const isSelected = (selected: GridPosition | null, position: GridPosition): boolean =>
  selected !== null && samePosition(selected, position)
</script>

<template>
  <div class="wf-kb-preview" :class="{ 'wf-kb-preview--reply': kind.keyboardType === KeyboardType.REPLY }">
    <div v-if="kind.keyboardType === KeyboardType.INLINE" class="wf-kb-preview__message">Message</div>

    <div v-for="(row, rowIndex) in grid.rows" :key="rowIndex" class="wf-kb-preview__row">
      <button
        v-for="(button, column) in row"
        :key="column"
        type="button"
        class="wf-kb-preview__button"
        :class="{
          'is-selected': isSelected(selected, { row: rowIndex, column }),
          'is-invalid': hasIssue({ row: rowIndex, column }),
        }"
        @click="emit('select', { row: rowIndex, column })"
      >
        <SlbIcon v-if="kind.icon(button)" :name="kind.icon(button)!" :size="12" />
        <span class="wf-kb-preview__text">{{ button.text || 'Untitled' }}</span>
      </button>
      <button
        v-if="grid.canAppendTo(rowIndex)"
        type="button"
        class="wf-kb-preview__add"
        title="Add a button to this row"
        aria-label="Add a button to this row"
        @click="emit('append', rowIndex)"
      >
        <SlbIcon name="action_plus" :size="12" />
      </button>
    </div>

    <button type="button" class="wf-kb-preview__add-row" @click="emit('appendRow')">
      <SlbIcon name="action_plus" :size="12" />
      {{ grid.isEmpty ? 'Add a button' : 'Add row' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.wf-kb-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--slb-color-gray-100);
  border-radius: var(--slb-radius-md);

  &--reply {
    padding-top: 8px;
    border-top: 2px solid var(--slb-color-border);
    border-radius: 0 0 var(--slb-radius-md) var(--slb-radius-md);
  }
}

.wf-kb-preview__message {
  align-self: flex-start;
  max-width: 80%;
  margin-bottom: 2px;
  padding: 6px 10px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  background: var(--slb-color-white, #fff);
  border-radius: var(--slb-radius-md) var(--slb-radius-md) var(--slb-radius-md) 2px;
}

.wf-kb-preview__row {
  display: flex;
  gap: 4px;
}

.wf-kb-preview__button {
  display: inline-flex;
  flex: 1;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  font-size: var(--slb-font-xs);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text);
  background: color-mix(in srgb, var(--slb-color-white, #fff) 75%, transparent);
  border: 1px solid transparent;
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &:hover {
    background: var(--slb-color-white, #fff);
  }

  &.is-invalid {
    border-color: var(--slb-color-error);
  }

  &.is-selected {
    border-color: var(--slb-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--slb-color-primary) 20%, transparent);
  }
}

.wf-kb-preview__text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.wf-kb-preview__add,
.wf-kb-preview__add-row {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 30px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  background: none;
  border: 1px dashed var(--slb-color-border);
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &:hover {
    color: var(--slb-color-primary);
    border-color: var(--slb-color-primary);
  }
}

.wf-kb-preview__add {
  flex: 0 0 30px;
}
</style>
