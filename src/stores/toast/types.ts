export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface ToastStoreState {
  items: ToastItem[]
}

export interface ToastStoreActions {
  show(type: ToastType, message: string, duration?: number): void
  success(message: string, duration?: number): void
  error(message: string, duration?: number): void
  warning(message: string, duration?: number): void
  info(message: string, duration?: number): void
  dismiss(id: string): void
}

export interface ToastStore extends ToastStoreState, ToastStoreActions {}
