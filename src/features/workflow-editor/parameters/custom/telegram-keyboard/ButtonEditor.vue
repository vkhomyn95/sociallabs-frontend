<script setup lang="ts" generic="B extends RowButton">
import { computed } from 'vue'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import type { FieldPath } from '@/core/node-types/parameters'
import ParameterForm from '../../ParameterForm.vue'
import ButtonMoveBar from './ButtonMoveBar.vue'
import type { MoveDirection, RowButton } from './buttonGrid'
import type { ButtonKind } from './buttonKinds'

/** The fields of the selected button, as the node declares them and as its kind adjusts them. */
const props = defineProps<{
  button: B
  kind: ButtonKind<B>
  /** Fields of one button, as the node declares them. */
  declared: readonly PropertyDescriptor[]
  movable: Readonly<Record<MoveDirection, boolean>>
  path: FieldPath
  issues: ReadonlyMap<FieldPath, string>
  typeKey: string
}>()

const emit = defineEmits<{
  update: [button: B]
  move: [direction: MoveDirection]
  remove: []
}>()

const fields = computed(() => props.kind.fields(props.declared, props.button))
const values = computed(() => props.button as Readonly<Record<string, unknown>>)
</script>

<template>
  <div class="wf-kb-editor">
    <div class="wf-kb-editor__header">
      <span>Selected button</span>
      <ButtonMoveBar :movable="movable" @move="emit('move', $event)" @remove="emit('remove')" />
    </div>
    <ParameterForm
      :properties="fields"
      :values="values"
      :path="path"
      :issues="issues"
      :type-key="typeKey"
      @update:values="emit('update', $event as B)"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-kb-editor {
  padding: 8px 12px 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}

.wf-kb-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>
