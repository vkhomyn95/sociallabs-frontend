<script setup lang="ts">
import { computed } from 'vue'
import { NEW_ROW, type AddTarget, type ButtonKind } from '../keyboard-common/keyboardLayout'
import AddButtonTile from './AddButtonTile.vue'
import ViberButtonCell from './ViberButtonCell.vue'
import { cardsOf } from './flowLayout'
import type { ViberButton } from './viberKeyboard.types'
import { previewColor } from './viberPreview'

/**
 * Rich media as Viber shows it in the chat: a carousel of cards, each a grid of `columns` × `rows` cells that buttons
 * fill in order; a button that no longer fits starts the next card. Buttons are picked for editing here.
 */
const props = defineProps<{
  buttons: readonly ViberButton[]
  kind: ButtonKind<ViberButton>
  columns: number
  rows: number
  /** The cards' background color. */
  background: unknown
  /** Index of the picked button. */
  selected: number | null
  hasIssue: (index: number) => boolean
}>()

const emit = defineEmits<{
  select: [index: number]
  add: [target: AddTarget]
}>()

const cards = computed(() => cardsOf(props.buttons, props.columns, props.rows))
const cardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gridTemplateRows: `repeat(${props.rows}, 26px)`,
  background: previewColor(props.background),
}))
</script>

<template>
  <div class="wf-viber-rich">
    <div v-if="cards.length" class="wf-viber-rich__carousel">
      <div v-for="(card, number) in cards" :key="number" class="wf-viber-rich__card" :style="cardStyle">
        <ViberButtonCell
          v-for="index in card"
          :key="index"
          :button="buttons[index]!"
          :kind="kind"
          :columns="columns"
          :rows="rows"
          :selected="selected === index"
          :invalid="hasIssue(index)"
          @select="emit('select', index)"
        />
      </div>
    </div>
    <span v-if="cards.length > 1" class="wf-viber-rich__count">{{ cards.length }} cards</span>
    <AddButtonTile :empty="!buttons.length" @add="emit('add', NEW_ROW)" />
  </div>
</template>

<style scoped lang="scss">
.wf-viber-rich {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--slb-color-gray-100);
  border-radius: var(--slb-radius-md);
}

.wf-viber-rich__carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.wf-viber-rich__card {
  display: grid;
  flex: 0 0 200px;
  grid-auto-rows: 26px;
  gap: 3px;
  padding: 6px;
  background: var(--slb-color-white, #fff);
  border-radius: var(--slb-radius-md);
  box-shadow: var(--slb-shadow-sm);
}

.wf-viber-rich__count {
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
