<script setup lang="ts">
import { useRadio } from './useRadio'

interface Props {
  modelValue: string | number | null
  value: string | number
  label?: string
  description?: string
  disabled?: boolean
  error?: boolean
  name?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}>()

const { isChecked, select } = useRadio(props)

const handleChange = (): void => {
  select(emit)
  emit('change', props.value)
}
</script>

<template>
  <label
    class="slb-radio"
    :class="{
      'slb-radio--checked': isChecked,
      'slb-radio--disabled': disabled,
      'slb-radio--error': error,
    }"
  >
    <input
      :id="id"
      class="slb-radio__native"
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
    />

    <span class="slb-radio__circle" aria-hidden="true"></span>

    <span v-if="label || description || $slots.default" class="slb-radio__content">
      <span v-if="label" class="slb-radio__label">{{ label }}</span>
      <slot />
      <span v-if="description" class="slb-radio__description">{{ description }}</span>
    </span>
  </label>
</template>

<style lang="scss">
@use './radio.scss';
</style>
