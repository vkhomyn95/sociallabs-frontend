export type ComponentSize = 'sm' | 'md' | 'lg'

export type ComponentVariant = 'default' | 'error' | 'success' | 'warning'

export interface BaseFieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: ComponentSize
}
