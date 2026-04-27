import { computed } from 'vue'

export interface UseCheckboxProps {
  modelValue: boolean | (string | number)[]
  value?: string | number
  disabled?: boolean
  indeterminate?: boolean
}

export function useCheckbox(props: UseCheckboxProps) {
  const isChecked = computed((): boolean => {
    if (Array.isArray(props.modelValue)) {
      return props.value !== undefined && props.modelValue.includes(props.value)
    }
    return props.modelValue === true
  })

  const toggle = (
    emit: (event: 'update:modelValue', payload: boolean | (string | number)[]) => void
  ): void => {
    if (props.disabled) return

    if (Array.isArray(props.modelValue)) {
      const next = [...props.modelValue]
      const idx = props.value !== undefined ? next.indexOf(props.value) : -1
      if (idx === -1 && props.value !== undefined) {
        next.push(props.value)
      } else if (idx !== -1) {
        next.splice(idx, 1)
      }
      emit('update:modelValue', next)
    } else {
      emit('update:modelValue', !props.modelValue)
    }
  }

  return { isChecked, toggle }
}
