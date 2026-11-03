<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import type { ButtonKind } from '../keyboard-common/keyboardLayout'
import { heightOf, spanOf } from './flowLayout'
import type { ViberButton } from './viberKeyboard.types'
import { plainText, previewColor, textColorOn } from './viberPreview'

/**
 * A button as Viber draws it on its grid: as wide and high as its cells, in its background color. Images are only
 * marked, the preview does not load them.
 */
const props = defineProps<{
  button: ViberButton
  kind: ButtonKind<ViberButton>
  /** Columns and rows of the grid it sits on. */
  columns: number
  rows: number
  selected: boolean
  invalid: boolean
}>()

const emit = defineEmits<{ select: [] }>()

const style = computed(() => {
  const background = previewColor(props.button.background)
  return {
    gridColumn: `span ${spanOf(props.button, props.columns)}`,
    gridRow: `span ${heightOf(props.button, props.rows)}`,
    background,
    color: textColorOn(background),
  }
})
const text = computed(() => plainText(props.button.text))
const icon = computed(() => props.kind.icon(props.button))
</script>

<template>
  <button
    type="button"
    class="wf-viber-cell"
    :class="{ 'is-selected': selected, 'is-invalid': invalid }"
    :style="style"
    @click="emit('select')"
  >
    <SlbIcon v-if="button.image" name="media_image" :size="12" class="wf-viber-cell__image" />
    <SlbIcon v-if="icon" :name="icon" :size="12" />
    <span class="wf-viber-cell__text">{{ text || (button.image ? '' : 'Untitled') }}</span>
  </button>
</template>

<style scoped lang="scss">
.wf-viber-cell {
  position: relative;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 6px;
  font-size: var(--slb-font-xs);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text);
  background: color-mix(in srgb, var(--slb-color-white, #fff) 85%, transparent);
  border: 1px solid transparent;
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }

  &.is-invalid {
    border-color: var(--slb-color-error);
  }

  &.is-selected {
    border-color: var(--slb-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--slb-color-primary) 20%, transparent);
  }
}

.wf-viber-cell__image {
  position: absolute;
  top: 3px;
  right: 3px;
  color: var(--slb-color-text-muted);
}

.wf-viber-cell__text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
