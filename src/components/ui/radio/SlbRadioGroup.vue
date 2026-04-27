<script setup lang="ts">
import SlbRadio from './SlbRadio.vue'
import type { RadioOption } from './useRadio'

interface Props {
  modelValue: string | number | null
  options: RadioOption[]
  name: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  variant: 'default',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}>()

const onSelect = (value: string | number): void => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <fieldset
    class="slb-radio-group"
    :class="{ [`slb-radio-group--${variant}`]: variant !== 'default' }"
    :aria-required="required"
    :aria-invalid="!!error"
    :aria-describedby="error ? `${name}-error` : hint ? `${name}-hint` : undefined"
  >
    <legend v-if="label" class="slb-radio-group__legend">
      {{ label }}
      <span v-if="required" class="slb-radio-group__required" aria-hidden="true">*</span>
    </legend>

    <div
      class="slb-radio-group__items"
      :class="{ 'slb-radio-group__items--vertical': orientation === 'vertical' }"
    >
      <SlbRadio
        v-for="option in options"
        :key="option.value"
        :model-value="modelValue"
        :value="option.value"
        :label="option.label"
        :description="option.description"
        :disabled="disabled || option.disabled"
        :error="!!error"
        :name="name"
        :id="`${name}-${option.value}`"
        @update:model-value="onSelect"
      />
    </div>

    <p v-if="error" :id="`${name}-error`" class="slb-radio-group__error" role="alert">
      <i class="fa-solid fa-circle-exclamation"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${name}-hint`" class="slb-radio-group__hint">
      {{ hint }}
    </p>
  </fieldset>
</template>

<style lang="scss">
@use './radio.scss';
</style>
