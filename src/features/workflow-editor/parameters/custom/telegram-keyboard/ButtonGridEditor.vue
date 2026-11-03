<script setup lang="ts" generic="B extends RowButton & { text?: string }">
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import { elementPath, type FieldPath } from '@/core/node-types/parameters'
import ButtonEditor from './ButtonEditor.vue'
import KeyboardPreview from './KeyboardPreview.vue'
import type { GridPosition, RowButton } from './buttonGrid'
import type { ButtonKind } from './buttonKinds'
import { useButtonGrid } from './useButtonGrid'

/** One keyboard's buttons: the preview to arrange them and the editor of the one picked. */
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

const state = useButtonGrid(
  () => props.buttons,
  props.kind,
  (buttons) => emit('update:buttons', buttons),
)
const { grid, selected, selectedButton, selectedIndex, movable } = state

/** Whether a button has a validation issue, so the preview can flag it while another one is open. */
function hasIssue(position: GridPosition): boolean {
  const prefix = elementPath(props.path, grid.value.indexOf(position))
  return [...props.issues.keys()].some((key) => key === prefix || key.startsWith(`${prefix}.`))
}
</script>

<template>
  <div class="wf-kb-grid">
    <KeyboardPreview
      :grid="grid"
      :kind="kind"
      :selected="selected"
      :has-issue="hasIssue"
      @select="state.select"
      @append="state.append"
      @append-row="state.appendRow"
    />
    <ButtonEditor
      v-if="selectedButton"
      :button="selectedButton"
      :kind="kind"
      :declared="declared"
      :movable="movable"
      :path="elementPath(path, selectedIndex)"
      :issues="issues"
      :type-key="typeKey"
      @update="state.update"
      @move="state.move"
      @remove="state.remove"
    />
    <p v-else-if="!grid.isEmpty" class="wf-kb-grid__hint">Pick a button to edit it</p>
  </div>
</template>

<style scoped lang="scss">
.wf-kb-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-kb-grid__hint {
  margin: 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
