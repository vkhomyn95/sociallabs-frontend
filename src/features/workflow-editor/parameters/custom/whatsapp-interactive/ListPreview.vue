<script setup lang="ts">
import { computed } from 'vue'
import { SlbIcon } from '@sociallabs/frontend-components'
import { ListPickKind, canAddRow, needsTitle, rowCount, type ListPick } from './listSections'
import { overLimit } from './replyButtonKind'
import { WhatsAppLimit, type ListSection } from './whatsappInteractive.types'

/**
 * The list as WhatsApp shows it: the message with the button that opens the list, then the opened list with its
 * sections and rows. A section title or a row is picked for editing here; a title longer than WhatsApp shows, or a
 * missing section title where several sections need one, is flagged.
 */
const props = defineProps<{
  sections: readonly ListSection[]
  header: string
  text: string
  footer: string
  buttonText: string
  pick: ListPick | null
  hasIssue: (pick: ListPick) => boolean
}>()

const emit = defineEmits<{
  pick: [pick: ListPick]
  addRow: [section: number]
  addSection: []
}>()

const rows = computed(() => rowCount(props.sections))
const canAdd = computed(() => canAddRow(props.sections))

const isPicked = (candidate: ListPick): boolean =>
  props.pick !== null && JSON.stringify(props.pick) === JSON.stringify(candidate)

const sectionPick = (section: number): ListPick => ({ kind: ListPickKind.SECTION, section })
const rowPick = (section: number, row: number): ListPick => ({ kind: ListPickKind.ROW, section, row })

function sectionInvalid(section: number): boolean {
  const title = props.sections[section]?.title
  return props.hasIssue(sectionPick(section)) || needsTitle(props.sections, section) || overLimit(title, WhatsAppLimit.SECTION_TITLE)
}

function rowInvalid(section: number, row: number): boolean {
  const value = props.sections[section]?.rows?.[row]
  return (
    props.hasIssue(rowPick(section, row)) ||
    overLimit(value?.title, WhatsAppLimit.ROW_TITLE) ||
    overLimit(value?.description, WhatsAppLimit.ROW_DESCRIPTION)
  )
}
</script>

<template>
  <div class="wf-wa-list">
    <div class="wf-wa-list__bubble">
      <p v-if="header" class="wf-wa-list__header">{{ header }}</p>
      <p class="wf-wa-list__text">{{ text || 'Message text' }}</p>
      <p v-if="footer" class="wf-wa-list__footer">{{ footer }}</p>
      <div class="wf-wa-list__open">
        <SlbIcon name="menu_list" :size="12" />
        {{ buttonText || 'List button' }}
      </div>
    </div>

    <div class="wf-wa-list__sheet">
      <section v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="wf-wa-list__section">
        <button
          type="button"
          class="wf-wa-list__section-title"
          :class="{ 'is-selected': isPicked(sectionPick(sectionIndex)), 'is-invalid': sectionInvalid(sectionIndex) }"
          @click="emit('pick', sectionPick(sectionIndex))"
        >
          {{ section.title || (sections.length > 1 ? 'Section title needed' : 'No section title') }}
        </button>
        <button
          v-for="(row, rowIndex) in section.rows"
          :key="rowIndex"
          type="button"
          class="wf-wa-list__row"
          :class="{ 'is-selected': isPicked(rowPick(sectionIndex, rowIndex)), 'is-invalid': rowInvalid(sectionIndex, rowIndex) }"
          @click="emit('pick', rowPick(sectionIndex, rowIndex))"
        >
          <span class="wf-wa-list__row-text">
            <span class="wf-wa-list__row-title">{{ row.title || 'Untitled' }}</span>
            <span v-if="row.description" class="wf-wa-list__row-description">{{ row.description }}</span>
          </span>
          <span class="wf-wa-list__radio" />
        </button>
        <button v-if="canAdd" type="button" class="wf-wa-list__add" @click="emit('addRow', sectionIndex)">
          <SlbIcon name="action_plus" :size="12" />
          Add row
        </button>
      </section>
      <button v-if="canAdd" type="button" class="wf-wa-list__add" @click="emit('addSection')">
        <SlbIcon name="action_plus" :size="12" />
        {{ sections.length ? 'Add section' : 'Add a section' }}
      </button>
    </div>
    <p class="wf-wa-list__limit">{{ rows }} of {{ WhatsAppLimit.LIST_ROWS }} rows</p>
  </div>
</template>

<style scoped lang="scss">
.wf-wa-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--slb-color-gray-50);
  border-radius: var(--slb-radius-md);

  &__bubble,
  &__sheet {
    padding: 8px 10px;
    background: var(--slb-color-surface);
    border-radius: var(--slb-radius-sm);
    box-shadow: 0 1px 1px rgb(0 0 0 / 0.06);
  }

  &__header,
  &__text,
  &__footer {
    margin: 0;
    font-size: var(--slb-font-sm);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__header {
    font-weight: var(--slb-fw-semibold);
  }

  &__footer {
    margin-top: 4px;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  &__open {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    padding-top: 6px;
    font-size: var(--slb-font-sm);
    color: var(--slb-color-sky);
    border-top: 1px solid var(--slb-color-border);
  }

  &__sheet {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__section-title,
  &__row {
    text-align: left;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--slb-radius-sm);
    cursor: pointer;

    &.is-selected {
      border-color: var(--slb-color-primary);
    }

    &.is-invalid {
      border-color: var(--slb-color-error);
    }
  }

  &__section-title {
    padding: 4px 6px;
    font-size: var(--slb-font-xs);
    font-weight: var(--slb-fw-semibold);
    color: var(--slb-color-success);
    text-transform: uppercase;
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
  }

  &__row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__row-title {
    font-size: var(--slb-font-sm);
  }

  &__row-description {
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
  }

  &__radio {
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--slb-color-border);
    border-radius: 50%;
  }

  &__add {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    height: 28px;
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

  &__limit {
    margin: 0;
    font-size: var(--slb-font-xs);
    color: var(--slb-color-text-muted);
    text-align: right;
  }
}
</style>
