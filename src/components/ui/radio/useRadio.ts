import { computed } from 'vue'

export interface RadioOption {
  label: string
  value: string | number
  description?: string
  disabled?: boolean
  icon?: string
}

export interface UseRadioProps {
  modelValue: string | number | null
  value: string | number
  disabled?: boolean
}

export function useRadio(props: UseRadioProps) {
  const isChecked = computed((): boolean => props.modelValue === props.value)

  const select = (
    emit: (event: 'update:modelValue', payload: string | number) => void
  ): void => {
    if (props.disabled) return
    emit('update:modelValue', props.value)
  }

  return { isChecked, select }
}
