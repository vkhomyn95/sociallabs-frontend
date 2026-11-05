<script setup lang="ts">
import { computed, ref } from 'vue'
import { childPath, elementPath, isRecord, type FieldPath } from '@/core/node-types/parameters'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import ParameterForm from '../../ParameterForm.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import { useOptionsContext } from '../../options/optionsContext'
import ButtonMoveBar from '../keyboard-common/ButtonMoveBar.vue'
import { MOVE_DIRECTIONS, type MoveDirection } from '../keyboard-common/keyboardLayout'
import ListPreview from './ListPreview.vue'
import {
  ListPickKind,
  addRow,
  addSection,
  canMoveRow,
  moveRow,
  removeRow,
  removeSection,
  sectionsOf,
  withRow,
  withSection,
  type ListChange,
  type ListPick,
} from './listSections'
import { InteractiveField, ListField, type ListRow, type ListSection } from './whatsappInteractive.types'

/**
 * The sections and rows of a WhatsApp list message: a preview with the node's texts and list button, and the editor of
 * the picked section title or row.
 */
const props = defineProps<FieldProps<unknown[]>>()
const emit = defineEmits<FieldEmits<unknown[]>>()

const context = useOptionsContext()
const pick = ref<ListPick | null>(null)

const parameters = computed(() => {
  const values = context?.parameters()
  return isRecord(values) ? values : {}
})
const textOf = (field: InteractiveField): string => {
  const value = parameters.value[field]
  return typeof value === 'string' ? value : ''
}
const sections = computed(() => sectionsOf(props.modelValue))

/** Fields of a section without its rows, which the preview edits; and the fields of one row. */
const sectionFields = computed(() => props.property.children.filter((child) => child.name !== ListField.ROWS))
const rowFields = computed<readonly PropertyDescriptor[]>(
  () => props.property.children.find((child) => child.name === ListField.ROWS)?.children ?? [],
)

/** The pick, unless the list changed under it. */
const current = computed<ListPick | null>(() => {
  const value = pick.value
  if (!value) return null
  const section = sections.value[value.section]
  if (!section) return null
  if (value.kind === ListPickKind.ROW && !section.rows?.[value.row]) return null
  return value
})

const pickedValues = computed<Readonly<Record<string, unknown>>>(() => {
  const value = current.value
  if (!value) return {}
  const section = sections.value[value.section]!
  if (value.kind === ListPickKind.SECTION) return section
  return section.rows![value.row]!
})

function pathOf(value: ListPick): FieldPath {
  const section = elementPath(props.path, value.section)
  if (value.kind === ListPickKind.SECTION) return section
  return elementPath(childPath(section, ListField.ROWS), value.row)
}

const movable = computed(() => {
  const value = current.value
  const entries = MOVE_DIRECTIONS.map((direction) => [
    direction,
    value?.kind === ListPickKind.ROW && canMoveRow(sections.value, value.section, value.row, direction),
  ])
  return Object.fromEntries(entries) as Record<MoveDirection, boolean>
})

function hasIssue(value: ListPick): boolean {
  const prefix = pathOf(value)
  return [...props.issues.keys()].some(
    (key) => key === prefix || (key.startsWith(`${prefix}.`) && !key.startsWith(`${prefix}.${ListField.ROWS}`)),
  )
}

function commit(next: readonly ListSection[]): void {
  emit('update:modelValue', next.length ? [...next] : undefined)
}

function apply(change: ListChange): void {
  commit(change.sections)
  pick.value = change.pick
}

function update(values: Record<string, unknown>): void {
  const value = current.value
  if (!value) return
  if (value.kind === ListPickKind.SECTION) {
    commit(withSection(sections.value, value.section, { ...(values as ListSection), rows: sections.value[value.section]!.rows }))
    return
  }
  commit(withRow(sections.value, value.section, value.row, values as ListRow))
}

function move(direction: MoveDirection): void {
  const value = current.value
  if (value?.kind === ListPickKind.ROW) apply(moveRow(sections.value, value.section, value.row, direction))
}

function remove(): void {
  const value = current.value
  if (!value) return
  if (value.kind === ListPickKind.SECTION) commit(removeSection(sections.value, value.section))
  else commit(removeRow(sections.value, value.section, value.row))
  pick.value = null
}
</script>

<template>
  <div class="wf-wa-sections">
    <ListPreview
      :sections="sections"
      :header="textOf(InteractiveField.HEADER)"
      :text="textOf(InteractiveField.TEXT)"
      :footer="textOf(InteractiveField.FOOTER)"
      :button-text="textOf(InteractiveField.BUTTON_TEXT)"
      :pick="current"
      :has-issue="hasIssue"
      @pick="pick = $event"
      @add-row="apply(addRow(sections, $event))"
      @add-section="apply(addSection(sections))"
    />
    <div v-if="current" class="wf-wa-sections__editor">
      <div class="wf-wa-sections__header">
        <span>{{ current.kind === ListPickKind.SECTION ? 'Selected section' : 'Selected row' }}</span>
        <ButtonMoveBar :movable="movable" @move="move" @remove="remove" />
      </div>
      <ParameterForm
        :properties="current.kind === ListPickKind.SECTION ? sectionFields : rowFields"
        :values="pickedValues"
        :path="pathOf(current)"
        :issues="issues"
        :type-key="typeKey"
        @update:values="update"
      />
    </div>
    <p v-else-if="sections.length" class="wf-wa-sections__hint">Pick a section title or a row to edit it</p>
  </div>
</template>

<style scoped lang="scss">
.wf-wa-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__editor {
    padding: 8px 12px 12px;
    background: var(--slb-color-gray-50);
    border: 1px solid var(--slb-color-border);
    border-radius: var(--slb-radius-md);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  &__hint {
    margin: 0;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }
}
</style>
