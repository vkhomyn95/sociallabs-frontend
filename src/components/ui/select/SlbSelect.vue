<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useSelect } from './useSelect'
import type { SelectOption } from './useSelect'
import type { ComponentSize } from '@/components/ui/ui.types'

interface Props {
  modelValue?: string | number | null
  options: SelectOption[]
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  size?: ComponentSize
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Select option',
  size: 'md',
  disabled: false,
  required: false,
  searchable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}>()

const rootRef = ref<HTMLElement | null>(null)

const {
  isOpen,
  search,
  selectedOption,
  filteredOptions,
  toggle,
  close,
  selectOption,
} = useSelect(props)

const onSelect = (option: SelectOption): void => {
  selectOption(option)
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

const onClickOutside = (event: MouseEvent): void => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="slb-select">
    <label v-if="label" :for="id" class="slb-select__label">
      {{ label }}
      <span v-if="required" class="slb-select__required" aria-hidden="true">*</span>
    </label>

    <button
      :id="id"
      type="button"
      class="slb-select__trigger"
      :class="[
        `slb-select__trigger--${size}`,
        { 'slb-select__trigger--open': isOpen },
        { 'slb-select__trigger--error': !!error },
        { 'slb-select__trigger--placeholder': !selectedOption },
      ]"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="toggle"
    >
      <i v-if="selectedOption?.icon" :class="selectedOption.icon" class="slb-select__trigger-icon" aria-hidden="true"></i>

      <span class="slb-select__trigger-text">
        {{ selectedOption?.label ?? placeholder }}
      </span>

      <i
        class="fa-solid fa-chevron-down slb-select__trigger-chevron"
        :class="{ 'slb-select__trigger-chevron--open': isOpen }"
        aria-hidden="true"
      ></i>
    </button>

    <Transition name="slb-select-dropdown">
      <div v-if="isOpen" class="slb-select__dropdown" role="listbox">

        <div v-if="searchable" class="slb-select__search">
          <i class="fa-regular fa-magnifying-glass" aria-hidden="true"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search..."
            aria-label="Search options"
            autofocus
          />
        </div>

        <div class="slb-select__options">
          <template v-if="filteredOptions.length > 0">
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              role="option"
              class="slb-select__option"
              :class="{
                'slb-select__option--selected': option.value === modelValue,
                'slb-select__option--disabled': option.disabled,
              }"
              :aria-selected="option.value === modelValue"
              :disabled="option.disabled"
              @click="onSelect(option)"
            >
              <i v-if="option.icon" :class="option.icon" aria-hidden="true"></i>
              <span>{{ option.label }}</span>
              <i
                v-if="option.value === modelValue"
                class="fa-solid fa-check slb-select__option-check"
                aria-hidden="true"
              ></i>
            </button>
          </template>

          <div v-else class="slb-select__empty">
            No options found
          </div>
        </div>

      </div>
    </Transition>

    <p v-if="error" class="slb-select__error" role="alert">
      <i class="fa-solid fa-circle-exclamation"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" class="slb-select__hint">
      {{ hint }}
    </p>
  </div>
</template>

<style lang="scss">
@use './select.scss';
</style>
