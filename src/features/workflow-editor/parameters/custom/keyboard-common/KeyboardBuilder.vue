<script setup lang="ts" generic="B">
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import { elementPath, type FieldPath } from '@/core/node-types/parameters'
import ButtonEditor from './ButtonEditor.vue'
import type { AddTarget, ButtonKind } from './keyboardLayout'
import { useKeyboardEditor } from './useKeyboardEditor'

/**
 * One keyboard's buttons: the messenger's preview, given as the `preview` slot, to pick and add buttons, and the editor
 * of the picked one. The slot gets the pick, a check for buttons with issues, and `select` / `add` to call.
 */
const props = defineProps<{
  buttons: readonly B[]
  kind: ButtonKind<B>
  /** Fields of one button, as the node declares them. */
  declared: readonly PropertyDescriptor[]
  /** Path of the list of buttons. */
  path: FieldPath
  issues: ReadonlyMap<FieldPath, string>
  typeKey: string
}>()

const emit = defineEmits<{ 'update:buttons': [buttons: B[]] }>()

defineSlots<{
  preview(props: {
    selected: number | null
    hasIssue: (index: number) => boolean
    select: (index: number) => void
    add: (target: AddTarget) => void
  }): unknown
}>()

const state = useKeyboardEditor(
  () => props.buttons,
  () => props.kind,
  (buttons) => emit('update:buttons', buttons),
)
const { selected, selectedButton, movable } = state

/** Whether a button has a validation issue, so the preview can flag it while another one is open. */
function hasIssue(index: number): boolean {
  const prefix = elementPath(props.path, index)
  return [...props.issues.keys()].some((key) => key === prefix || key.startsWith(`${prefix}.`))
}
</script>

<template>
  <div class="wf-kb-builder">
    <slot name="preview" :selected="selected" :has-issue="hasIssue" :select="state.select" :add="state.add" />
    <ButtonEditor
      v-if="selectedButton !== null && selected !== null"
      :button="selectedButton"
      :kind="kind"
      :declared="declared"
      :movable="movable"
      :path="elementPath(path, selected)"
      :issues="issues"
      :type-key="typeKey"
      @update="state.update"
      @move="state.move"
      @remove="state.remove"
    />
    <p v-else-if="buttons.length" class="wf-kb-builder__hint">Pick a button to edit it</p>
  </div>
</template>

<style scoped lang="scss">
.wf-kb-builder {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-kb-builder__hint {
  margin: 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
