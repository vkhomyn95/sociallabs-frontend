<script setup lang="ts">
import { useInput } from './useInput'
import type { ComponentSize } from '@/components/ui/ui.types'

interface Props {
  modelValue?: string | number | null
  type?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  size?: ComponentSize
  iconLeft?: string
  iconRight?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  type: 'text',
  size: 'md',
  clearable: false,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'clear': []
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const {
  resolvedType,
  variant,
  hasValue,
  togglePasswordVisibility,
  isPasswordVisible,
} = useInput(props)

const onInput = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const onClear = (): void => {
  emit('update:modelValue', '')
  emit('clear')
}

const hasPaddingRight = (): boolean => {
  return props.type === 'password' || (!!props.clearable && hasValue.value) || !!props.iconRight
}
</script>

<template>
  <div class="slb-input">
    <label v-if="label" :for="id" class="slb-input__label">
      {{ label }}
      <span v-if="required" class="slb-input__required" aria-hidden="true">*</span>
    </label>

    <div
      class="slb-input__control"
      :class="[
        `slb-input__control--${size}`,
        `slb-input__control--${variant}`,
        { 'slb-input__control--disabled': disabled },
      ]"
    >
      <!-- Left icon (decorative) -->
      <span v-if="iconLeft" class="slb-input__icon slb-input__icon--left" aria-hidden="true">
        <i :class="iconLeft"></i>
      </span>

      <input
        :id="id"
        class="slb-input__native"
        :class="[
          { 'slb-input__native--icon-left': !!iconLeft },
          { 'slb-input__native--icon-right': hasPaddingRight() && !iconLeft },
          { 'slb-input__native--icon-both': !!iconLeft && hasPaddingRight() },
        ]"
        :type="resolvedType"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
        v-bind="$attrs"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Right: static icon OR password toggle OR clear -->
      <span v-if="iconRight && type !== 'password' && !clearable" class="slb-input__icon slb-input__icon--right" aria-hidden="true">
        <i :class="iconRight"></i>
      </span>

      <button
        v-if="type === 'password'"
        type="button"
        class="slb-input__action"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
        @click="togglePasswordVisibility"
      >
        <i :class="isPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
      </button>

      <button
        v-else-if="clearable && hasValue"
        type="button"
        class="slb-input__action"
        aria-label="Clear input"
        @click="onClear"
      >
        <i class="fa-regular fa-xmark"></i>
      </button>
    </div>

    <p v-if="error" :id="`${id}-error`" class="slb-input__error" role="alert">
      <i class="fa-solid fa-circle-exclamation"></i>
      {{ error }}
    </p>
    <p v-else-if="success" class="slb-input__success">
      <i class="fa-solid fa-circle-check"></i>
      {{ success }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="slb-input__hint">
      {{ hint }}
    </p>
  </div>
</template>

<style lang="scss">
@use './input.scss';
</style>
