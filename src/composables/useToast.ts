import { useToastStore } from '@/stores/toast'

export function useToast() {
  const store = useToastStore()

  return {
    success: (message: string, duration?: number) => store.success(message, duration),
    error:   (message: string, duration?: number) => store.error(message, duration),
    warning: (message: string, duration?: number) => store.warning(message, duration),
    info:    (message: string, duration?: number) => store.info(message, duration),
    dismiss: (id: string)                         => store.dismiss(id),
  }
}
