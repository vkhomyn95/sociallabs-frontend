<script setup lang="ts">
import { SlbButton, type SlbIconName } from '@sociallabs/frontend-components'
import { MoveDirection } from './buttonGrid'

/** Moves the selected button around the grid, or removes it. */
defineProps<{ movable: Readonly<Record<MoveDirection, boolean>> }>()
const emit = defineEmits<{ move: [direction: MoveDirection]; remove: [] }>()

const MOVES: Readonly<Record<MoveDirection, { icon: SlbIconName; label: string }>> = {
  [MoveDirection.LEFT]: { icon: 'arrow_left', label: 'Move left' },
  [MoveDirection.RIGHT]: { icon: 'arrow_right', label: 'Move right' },
  [MoveDirection.UP]: { icon: 'arrow_up', label: 'Move to the row above' },
  [MoveDirection.DOWN]: { icon: 'arrow_down', label: 'Move to the row below' },
}

const DIRECTIONS = Object.values(MoveDirection)
</script>

<template>
  <div class="wf-kb-moves">
    <SlbButton
      v-for="direction in DIRECTIONS"
      :key="direction"
      variant="ghost"
      size="sm"
      icon-only
      :icon-left="MOVES[direction].icon"
      :title="MOVES[direction].label"
      :aria-label="MOVES[direction].label"
      :disabled="!movable[direction]"
      @click="emit('move', direction)"
    />
    <SlbButton
      variant="ghost"
      size="sm"
      icon-only
      icon-left="action_trash"
      title="Remove the button"
      aria-label="Remove the button"
      @click="emit('remove')"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-kb-moves {
  display: flex;
  gap: 2px;
}
</style>
