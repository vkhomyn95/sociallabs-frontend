import { computed, ref } from 'vue'
import type { ComponentSize, ComponentVariant } from '@/components/ui/ui.types'

export interface UseInputProps {
  modelValue: string | number | null
  type?: string
  size?: ComponentSize
  error?: string
  success?: string
  disabled?: boolean
  clearable?: boolean
  toggleable?: boolean
}

export function useInput(props: UseInputProps) {
  const isPasswordVisible = ref(false)

  const resolvedType = computed((): string => {
    if (props.type === 'password') {
      return isPasswordVisible.value ? 'text' : 'password'
    }
    return props.type ?? 'text'
  })

  const variant = computed((): ComponentVariant => {
    if (props.error) return 'error'
    if (props.success) return 'success'
    return 'default'
  })

  const hasValue = computed((): boolean => {
    return props.modelValue !== null &&
      props.modelValue !== undefined &&
      String(props.modelValue).length > 0
  })

  const togglePasswordVisibility = (): void => {
    isPasswordVisible.value = !isPasswordVisible.value
  }

  return {
    isPasswordVisible,
    resolvedType,
    variant,
    hasValue,
    togglePasswordVisibility,
  }
}
