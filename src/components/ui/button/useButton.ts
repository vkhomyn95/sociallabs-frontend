import { computed } from 'vue'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface UseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  iconOnly?: boolean
}

export function useButton(props: UseButtonProps) {
  const isDisabled = computed((): boolean => {
    return props.disabled === true || props.loading === true
  })

  const classes = computed((): Record<string, boolean> => ({
    [`slb-btn--${props.variant ?? 'primary'}`]: true,
    [`slb-btn--${props.size ?? 'md'}`]: true,
    'slb-btn--loading': props.loading === true,
    'slb-btn--disabled': isDisabled.value,
    'slb-btn--icon-only': props.iconOnly === true,
  }))

  return { isDisabled, classes }
}
