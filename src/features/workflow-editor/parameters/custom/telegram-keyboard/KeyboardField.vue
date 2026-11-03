<script setup lang="ts">
import { computed } from 'vue'
import { SlbAlert } from '@sociallabs/frontend-components'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import { childPath, effectiveValue, isRecord } from '@/core/node-types/parameters'
import ParameterForm from '../../ParameterForm.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import { useOptionsContext } from '../../options/optionsContext'
import ButtonGridEditor from './ButtonGridEditor.vue'
import { INLINE_BUTTONS, REPLY_BUTTONS } from './buttonKinds'
import { KeyboardField, KeyboardType, type InlineButton, type ReplyButton } from './keyboard.types'
import { isKeyboardType, keyboardTypesFor } from './keyboardTypes'

/**
 * The keyboard of a Telegram Bot message: its type, a builder of inline or reply buttons with a preview, then the
 * settings of that type (placeholder, JSON …) as the node declares them. Operations that edit a message offer only
 * the keyboards Telegram accepts there.
 */
const props = defineProps<FieldProps<Record<string, unknown>>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>>>()

const BUILDER_FIELDS: ReadonlySet<string> = new Set<string>([
  KeyboardField.TYPE,
  KeyboardField.INLINE_BUTTONS,
  KeyboardField.REPLY_BUTTONS,
])

const context = useOptionsContext()

const values = computed(() => (isRecord(props.modelValue) ? props.modelValue : {}))
const declared = (name: KeyboardField): PropertyDescriptor | undefined => props.property.children.find((child) => child.name === name)

const allowed = computed(() => keyboardTypesFor(context?.parameters()))
const type = computed(() => {
  const property = declared(KeyboardField.TYPE)
  const value = property ? effectiveValue(property, values.value) : undefined
  return isKeyboardType(value) ? value : KeyboardType.NONE
})
const unsupported = computed(() => !allowed.value.has(type.value))

/** The type field offering the keyboards the operation accepts, plus the chosen one so it still reads by name. */
const typeProperty = computed((): PropertyDescriptor[] => {
  const property = declared(KeyboardField.TYPE)
  if (!property) return []
  const offered = property.options.filter((option) => isKeyboardType(option.value) && (allowed.value.has(option.value) || option.value === type.value))
  return [{ ...property, options: offered }]
})
const settings = computed(() => props.property.children.filter((child) => !BUILDER_FIELDS.has(child.name)))

const buttonFields = (list: KeyboardField): readonly PropertyDescriptor[] => declared(list)?.children ?? []

function buttonsOf<B>(list: KeyboardField): B[] {
  const buttons = values.value[list]
  return Array.isArray(buttons) ? (buttons.filter(isRecord) as B[]) : []
}

const inlineButtons = computed(() => buttonsOf<InlineButton>(KeyboardField.INLINE_BUTTONS))
const replyButtons = computed(() => buttonsOf<ReplyButton>(KeyboardField.REPLY_BUTTONS))

function set(next: Record<string, unknown>): void {
  emit('update:modelValue', Object.keys(next).length ? next : undefined)
}

function setButtons(list: KeyboardField, buttons: readonly unknown[]): void {
  const next: Record<string, unknown> = { ...values.value }
  if (buttons.length) next[list] = buttons
  else delete next[list]
  set(next)
}
</script>

<template>
  <div class="wf-keyboard">
    <ParameterForm :properties="typeProperty" :values="values" :path="path" :issues="issues" :type-key="typeKey" @update:values="set" />

    <SlbAlert v-if="unsupported" variant="warning">
      An edited message or an invoice takes only inline buttons; pick Inline buttons, JSON or None.
    </SlbAlert>

    <ButtonGridEditor
      v-if="type === KeyboardType.INLINE"
      :buttons="inlineButtons"
      :kind="INLINE_BUTTONS"
      :declared="buttonFields(KeyboardField.INLINE_BUTTONS)"
      :path="childPath(path, KeyboardField.INLINE_BUTTONS)"
      :issues="issues"
      :type-key="typeKey"
      @update:buttons="setButtons(KeyboardField.INLINE_BUTTONS, $event)"
    />
    <ButtonGridEditor
      v-else-if="type === KeyboardType.REPLY"
      :buttons="replyButtons"
      :kind="REPLY_BUTTONS"
      :declared="buttonFields(KeyboardField.REPLY_BUTTONS)"
      :path="childPath(path, KeyboardField.REPLY_BUTTONS)"
      :issues="issues"
      :type-key="typeKey"
      @update:buttons="setButtons(KeyboardField.REPLY_BUTTONS, $event)"
    />

    <ParameterForm :properties="settings" :values="values" :path="path" :issues="issues" :type-key="typeKey" @update:values="set" />
  </div>
</template>

<style scoped lang="scss">
.wf-keyboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}
</style>
