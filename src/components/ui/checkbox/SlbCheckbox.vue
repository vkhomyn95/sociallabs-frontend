<script setup lang="ts">
import { useCheckbox } from './useCheckbox'

interface Props {
  modelValue: boolean | (string | number)[]
  value?: string | number
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  indeterminate?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  indeterminate: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | (string | number)[]]
  'change': [checked: boolean]
}>()

const { isChecked, toggle } = useCheckbox(props)

const handleToggle = (): void => {
  toggle(emit)
  emit('change', !isChecked.value)
}
</script>

<template>
  <label
    class="slb-checkbox"
    :class="{
      'slb-checkbox--checked': isChecked,
      'slb-checkbox--indeterminate': indeterminate && !isChecked,
      'slb-checkbox--disabled': disabled,
      'slb-checkbox--error': !!error,
    }"
  >
    <input
      :id="id"
      class="slb-checkbox__native"
      type="checkbox"
      :checked="isChecked"
      :indeterminate="indeterminate && !isChecked"
      :disabled="disabled"
      :aria-checked="indeterminate ? 'mixed' : isChecked"
      :aria-describedby="error ? `${id}-error` : undefined"
      @change="handleToggle"
    />

    <span class="slb-checkbox__box" aria-hidden="true">
      <i
        :class="indeterminate && !isChecked
          ? 'fa-solid fa-minus'
          : 'fa-solid fa-check'"
      ></i>
    </span>

    <span v-if="label || description || $slots.default" class="slb-checkbox__content">
      <span v-if="label" class="slb-checkbox__label">{{ label }}</span>
      <slot />
      <span v-if="description" class="slb-checkbox__description">{{ description }}</span>
      <span v-if="error" :id="`${id}-error`" class="slb-checkbox__error" role="alert">
        <i class="fa-solid fa-circle-exclamation"></i>
        {{ error }}
      </span>
    </span>
  </label>
</template>

<style lang="scss">
@use './checkbox.scss';
</style>
