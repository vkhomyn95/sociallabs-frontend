<script setup lang="ts">
import { NEW_ROW, type AddTarget, type ButtonKind } from '../keyboard-common/keyboardLayout'
import AddButtonTile from './AddButtonTile.vue'
import ViberButtonCell from './ViberButtonCell.vue'
import { GRID_COLUMNS, MAX_KEYBOARD_BUTTON_ROWS, type ViberButton } from './viberKeyboard.types'
import { previewColor } from './viberPreview'

/**
 * The keyboard as Viber lays it out in place of the user's: a grid six columns wide that buttons fill in order, each
 * as wide and high as it says. Buttons are picked for editing here; a new one goes last.
 */
defineProps<{
  buttons: readonly ViberButton[]
  kind: ButtonKind<ViberButton>
  /** The keyboard's background color. */
  background: unknown
  /** Index of the picked button. */
  selected: number | null
  hasIssue: (index: number) => boolean
}>()

const emit = defineEmits<{
  select: [index: number]
  add: [target: AddTarget]
}>()
</script>

<template>
  <div class="wf-viber-keyboard" :style="{ background: previewColor(background) }">
    <div v-if="buttons.length" class="wf-viber-keyboard__grid" :style="{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }">
      <ViberButtonCell
        v-for="(button, index) in buttons"
        :key="index"
        :button="button"
        :kind="kind"
        :columns="GRID_COLUMNS"
        :rows="MAX_KEYBOARD_BUTTON_ROWS"
        :selected="selected === index"
        :invalid="hasIssue(index)"
        @select="emit('select', index)"
      />
    </div>
    <AddButtonTile :empty="!buttons.length" @add="emit('add', NEW_ROW)" />
  </div>
</template>

<style scoped lang="scss">
.wf-viber-keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--slb-color-gray-100);
  border-top: 2px solid var(--slb-color-border);
  border-radius: 0 0 var(--slb-radius-md) var(--slb-radius-md);
}

.wf-viber-keyboard__grid {
  display: grid;
  grid-auto-rows: 30px;
  gap: 4px;
}
</style>
