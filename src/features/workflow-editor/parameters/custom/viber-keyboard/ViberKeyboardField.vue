<script setup lang="ts">
import { computed } from 'vue'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import { childPath, effectiveValue, isRecord } from '@/core/node-types/parameters'
import ParameterForm from '../../ParameterForm.vue'
import type { FieldEmits, FieldProps } from '../../fields/fieldProps'
import KeyboardBuilder from '../keyboard-common/KeyboardBuilder.vue'
import ViberKeyboardPreview from './ViberKeyboardPreview.vue'
import { KEYBOARD_BUTTONS } from './viberButtonKinds'
import { buttonsOf, withButtons } from './viberButtons'
import { ViberKeyboardField as Field, ViberKeyboardType, type ViberButton } from './viberKeyboard.types'

/**
 * The keyboard of a Viber Bot message: its type, a builder of buttons on Viber's six-column grid with a preview, then
 * the keyboard's settings (height, input field, background …) as the node declares them.
 */
const props = defineProps<FieldProps<Record<string, unknown>>>()
const emit = defineEmits<FieldEmits<Record<string, unknown>>>()

const BUILDER_FIELDS: ReadonlySet<string> = new Set<string>([Field.TYPE, Field.BUTTONS])

const values = computed(() => (isRecord(props.modelValue) ? props.modelValue : {}))
const declared = (name: Field): PropertyDescriptor | undefined => props.property.children.find((child) => child.name === name)

const typeProperty = computed(() => {
  const property = declared(Field.TYPE)
  return property ? [property] : []
})
const type = computed(() => {
  const property = declared(Field.TYPE)
  return property ? effectiveValue(property, values.value) : ViberKeyboardType.NONE
})
const settings = computed(() => props.property.children.filter((child) => !BUILDER_FIELDS.has(child.name)))
const buttonFields = computed(() => declared(Field.BUTTONS)?.children ?? [])
const buttons = computed(() => buttonsOf(values.value[Field.BUTTONS]))

function set(next: Record<string, unknown>): void {
  emit('update:modelValue', Object.keys(next).length ? next : undefined)
}

function setButtons(next: readonly ViberButton[]): void {
  set(withButtons(values.value, Field.BUTTONS, next))
}
</script>

<template>
  <div class="wf-viber-keyboard-field">
    <ParameterForm :properties="typeProperty" :values="values" :path="path" :issues="issues" :type-key="typeKey" @update:values="set" />

    <KeyboardBuilder
      v-if="type === ViberKeyboardType.BUTTONS"
      :buttons="buttons"
      :kind="KEYBOARD_BUTTONS"
      :declared="buttonFields"
      :path="childPath(path, Field.BUTTONS)"
      :issues="issues"
      :type-key="typeKey"
      @update:buttons="setButtons"
    >
      <template #preview="preview">
        <ViberKeyboardPreview
          :buttons="buttons"
          :kind="KEYBOARD_BUTTONS"
          :background="values[Field.BACKGROUND]"
          :selected="preview.selected"
          :has-issue="preview.hasIssue"
          @select="preview.select"
          @add="preview.add"
        />
      </template>
    </KeyboardBuilder>

    <ParameterForm :properties="settings" :values="values" :path="path" :issues="issues" :type-key="typeKey" @update:values="set" />
  </div>
</template>

<style scoped lang="scss">
.wf-viber-keyboard-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--slb-color-gray-50);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
}
</style>
