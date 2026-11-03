<script setup lang="ts">
import { computed } from 'vue'
import { isRecord } from '@/core/node-types/parameters'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import { useOptionsContext } from '../../options/optionsContext'
import KeyboardBuilder from '../keyboard-common/KeyboardBuilder.vue'
import RichMediaPreview from './RichMediaPreview.vue'
import { richMediaButtons } from './viberButtonKinds'
import { buttonsOf, cellsOf } from './viberButtons'
import { GRID_COLUMNS, MAX_RICH_MEDIA_ROWS, RichMediaField, type ViberButton } from './viberKeyboard.types'

/**
 * The buttons of a Viber rich media message: a carousel preview whose card size and background come from the node's
 * own rich media fields, and the editor of the picked button.
 */
const props = defineProps<FieldProps<unknown[]>>()
const emit = defineEmits<FieldEmits<unknown[]>>()

const context = useOptionsContext()

const parameters = computed(() => {
  const values = context?.parameters()
  return isRecord(values) ? values : {}
})
const columns = computed(() => cellsOf(parameters.value[RichMediaField.COLUMNS], GRID_COLUMNS))
const rows = computed(() => cellsOf(parameters.value[RichMediaField.ROWS], MAX_RICH_MEDIA_ROWS))
const kind = computed(() => richMediaButtons(columns.value, rows.value))
const buttons = computed(() => buttonsOf(props.modelValue))

function setButtons(next: readonly ViberButton[]): void {
  emit('update:modelValue', next.length ? [...next] : undefined)
}
</script>

<template>
  <KeyboardBuilder
    :buttons="buttons"
    :kind="kind"
    :declared="property.children"
    :path="path"
    :issues="issues"
    :type-key="typeKey"
    @update:buttons="setButtons"
  >
    <template #preview="preview">
      <RichMediaPreview
        :buttons="buttons"
        :kind="kind"
        :columns="columns"
        :rows="rows"
        :background="parameters[RichMediaField.BACKGROUND]"
        :selected="preview.selected"
        :has-issue="preview.hasIssue"
        @select="preview.select"
        @add="preview.add"
      />
    </template>
  </KeyboardBuilder>
</template>
