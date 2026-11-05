<script setup lang="ts">
import { computed } from 'vue'
import { isRecord } from '@/core/node-types/parameters'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import { useOptionsContext } from '../../options/optionsContext'
import KeyboardBuilder from '../keyboard-common/KeyboardBuilder.vue'
import { NEW_ROW } from '../keyboard-common/keyboardLayout'
import ReplyButtonsPreview from './ReplyButtonsPreview.vue'
import { REPLY_BUTTONS, replyButtonsOf } from './replyButtonKind'
import { InteractiveField, type ReplyButton } from './whatsappInteractive.types'

/** The reply buttons of a WhatsApp message: a preview with the node's text and footer, and the picked button's editor. */
const props = defineProps<FieldProps<unknown[]>>()
const emit = defineEmits<FieldEmits<unknown[]>>()

const context = useOptionsContext()

const parameters = computed(() => {
  const values = context?.parameters()
  return isRecord(values) ? values : {}
})
const textOf = (field: InteractiveField): string => {
  const value = parameters.value[field]
  return typeof value === 'string' ? value : ''
}
const buttons = computed(() => replyButtonsOf(props.modelValue))

function setButtons(next: readonly ReplyButton[]): void {
  emit('update:modelValue', next.length ? [...next] : undefined)
}
</script>

<template>
  <KeyboardBuilder
    :buttons="buttons"
    :kind="REPLY_BUTTONS"
    :declared="property.children"
    :path="path"
    :issues="issues"
    :type-key="typeKey"
    @update:buttons="setButtons"
  >
    <template #preview="preview">
      <ReplyButtonsPreview
        :buttons="buttons"
        :body="textOf(InteractiveField.BODY)"
        :footer="textOf(InteractiveField.FOOTER)"
        :selected="preview.selected"
        :has-issue="preview.hasIssue"
        @select="preview.select"
        @add="preview.add(NEW_ROW)"
      />
    </template>
  </KeyboardBuilder>
</template>
